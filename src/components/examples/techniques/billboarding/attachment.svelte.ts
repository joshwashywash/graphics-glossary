import type { State } from "./state.svelte";

import booImageMetadata from "@assets/boo.png";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";
import { loadImage } from "@functions/loadImage";

import type { Attachment } from "svelte/attachments";
import { devicePixelRatio } from "svelte/reactivity/window";
import {
	BoxGeometry,
	CanvasTexture,
	Mesh,
	MeshNormalMaterial,
	NearestFilter,
	PerspectiveCamera,
	RepeatWrapping,
	Scene,
	Sprite,
	SpriteMaterial,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const tau = 2 * Math.PI;

const forwardsFrameCount = 18;

/**
 * number of frames to show during the last half of the rotation
 * equal to `frameCount` minus the first and last *frames*
 */
const backwardsFrameCount = forwardsFrameCount - 2;

const frameCount = forwardsFrameCount + backwardsFrameCount;

const spriteWidth = booImageMetadata.width / forwardsFrameCount;

/** the width of the image minus the width of the first and last sprites */
const extensionWidth = booImageMetadata.width - 2 * spriteWidth;

export const createBillboarding = (
	state: State,
): { attachment: Attachment; dispose(): void } => {
	const booCanvas = new OffscreenCanvas(
		booImageMetadata.width + extensionWidth,
		booImageMetadata.height,
	);
	const booCanvasContext = booCanvas.getContext("2d");

	// the example can not work without the context so just throw and let the boundary handle it
	if (booCanvasContext === null) {
		throw new Error("texture context is null");
	}

	const canvasTexture = new CanvasTexture(booCanvas);
	canvasTexture.minFilter = NearestFilter;
	canvasTexture.magFilter = NearestFilter;

	canvasTexture.generateMipmaps = false;

	canvasTexture.wrapS = RepeatWrapping;
	canvasTexture.wrapT = RepeatWrapping;
	canvasTexture.repeat.x = 1 / frameCount;

	loadImage(
		booImageMetadata.src,
		booImageMetadata.width,
		booImageMetadata.height,
	).then((image) => {
		booCanvasContext.drawImage(image, 0, 0);

		booCanvasContext.save();
		booCanvasContext.scale(-1, 1);

		// draw the image flipped but leave out the first and last sprites
		booCanvasContext.drawImage(
			image,
			spriteWidth,
			0,
			extensionWidth,
			image.height,
			-1 * image.width,
			0,
			-1 * extensionWidth,
			image.height,
		);
		booCanvasContext.restore();

		canvasTexture.needsUpdate = true;
	});

	const spriteMaterial = new SpriteMaterial({
		map: canvasTexture,
	});

	const sprite = new Sprite(spriteMaterial);
	sprite.translateZ(1);

	const material = new MeshNormalMaterial();
	const geometry = new BoxGeometry();

	const mesh = new Mesh(geometry, material);
	mesh.scale.setScalar(0.5);
	mesh.translateZ(-1);

	const scene = new Scene().add(sprite, mesh);

	const camera = new PerspectiveCamera();
	camera.translateZ(4);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const controls = new OrbitControls(camera);
	controls.autoRotateSpeed = 10;
	controls.maxPolarAngle = 0.5 * Math.PI;
	controls.minPolarAngle = 0.5 * Math.PI;

	let lastOffset: number;

	return {
		attachment(canvas) {
			const renderer = new WebGLRenderer({
				canvas,
				...state.rendererParameters,
			});

			$effect(() => {
				updateCameraAspect(state.aspect);
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(state.canvasWidth, state.canvasHeight);
			});

			$effect(() => {
				renderer.setPixelRatio(devicePixelRatio.current ?? 1);
			});

			$effect(() => {
				controls.autoRotate = state.useAutoRotate;
			});

			renderer.setAnimationLoop(() => {
				if (controls.autoRotate) {
					controls.update();
					render();
				}

				let angle = camera.position.angleTo(sprite.position);

				// determine if the larger angle should be used
				const o =
					camera.position.x * sprite.position.z -
					camera.position.z * sprite.position.x;
				if (o < 0) angle = tau - angle;

				const offset = Math.floor(frameCount * (angle / tau));

				if (lastOffset === offset) return;

				canvasTexture.offset.x = offset / frameCount;
				lastOffset = offset;
			});

			controls.addEventListener("change", render);
			controls.connect(renderer.domElement);

			return () => {
				controls.removeEventListener("change", render);
				controls.disconnect();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		},
		dispose() {
			scene.remove(sprite, mesh);
			canvasTexture.dispose();

			spriteMaterial.dispose();

			material.dispose();
			geometry.dispose();
		},
	};
};
