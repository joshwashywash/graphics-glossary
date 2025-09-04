import { createShadowGradient } from "../createShadowGradient";
import { createFloorMesh } from "./createFloorMesh";
import { createShadowMesh } from "./createShadowMesh";
import { createSphereMesh } from "./createSphereMesh";
import type { State } from "./state.svelte";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import { devicePixelRatio } from "svelte/reactivity/window";
import {
	CanvasTexture,
	Group,
	MathUtils,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	Vector3,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const _cameraAxis = new Vector3(1, 1, 1).normalize();

export const createSimpleShadow = (
	state: State,
): {
	attachment: Attachment<HTMLCanvasElement>;
	dispose(): void;
} => {
	const textureCanvasSize = 128;
	const textureCanvas = new OffscreenCanvas(
		textureCanvasSize,
		textureCanvasSize,
	);

	const context = textureCanvas.getContext("2d");
	// can't really do anything if the context is null so just let the boundary catch the error
	if (context === null) {
		throw new Error("canvas texture context is null");
	}

	const shadowMap = new CanvasTexture(textureCanvas);
	const shadowMaterial = new MeshBasicMaterial({
		depthWrite: false,
		map: shadowMap,
		transparent: true,
	});

	const sphereRadius = 1;
	const { dispose: disposeShadow, mesh: shadowMesh } = createShadowMesh(
		shadowMaterial,
		2 * sphereRadius,
	);

	shadowMesh.translateZ(0.01);

	const floorSize = 6;
	const { dispose: disposeFloor, mesh: floorMesh } = createFloorMesh(floorSize);

	const group = new Group().add(shadowMesh, floorMesh);
	group.rotateX(-1 * 0.5 * Math.PI);

	const positionYInitial = 2.5;

	const { dispose: disposeSphere, mesh: sphereMesh } = createSphereMesh(1);

	const scene = new Scene().add(sphereMesh, group);

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(_cameraAxis, 12);
	camera.lookAt(sphereMesh.position);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const controls = new OrbitControls(camera);

	const speed = 1 / 1000;

	return {
		attachment(canvas) {
			const renderer = new WebGLRenderer({
				canvas,
				...state.rendererParameters,
			});

			$effect(() => {
				renderer.setSize(state.canvasWidth, state.canvasHeight);
			});

			$effect(() => {
				renderer.setPixelRatio(devicePixelRatio.current ?? 1);
			});

			$effect(() => {
				updateCameraAspect(state.aspect);
			});

			$effect(() => {
				context.fillStyle = createShadowGradient(context, state.shadowColor);
				context.fillRect(0, 0, context.canvas.width, context.canvas.height);
				shadowMap.needsUpdate = true;
				return () => {
					context.clearRect(0, 0, context.canvas.width, context.canvas.height);
					shadowMap.needsUpdate = true;
				};
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			renderer.setAnimationLoop((time) => {
				time *= speed;

				// convert sin's -1 -> 1 interval to lerp's intervial of 0 -> 1
				const t = 0.5 * (1 + Math.sin(time));

				sphereMesh.position.y = MathUtils.lerp(
					positionYInitial - 1,
					positionYInitial + 1,
					t,
				);
				shadowMesh.scale.setScalar(1 + t);

				shadowMaterial.opacity = MathUtils.lerp(1, 0, t);
				render();
			});

			controls.connect(renderer.domElement);

			controls.addEventListener("change", render);

			return () => {
				controls.removeEventListener("change", render);
				controls.disconnect();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		},
		dispose() {
			for (const child of scene.children) child.removeFromParent();
			for (const child of group.children) child.removeFromParent();

			disposeSphere();
			disposeFloor();
			disposeShadow();
			shadowMap.dispose();
			shadowMaterial.dispose();
		},
	};
};
