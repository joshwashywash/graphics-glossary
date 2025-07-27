<script
	lang="ts"
	module
>
	const tau = 2 * Math.PI;

	const forwardsFrameCount = 18;

	/**
	 * number of frames to show during the last half of the rotation.
	 * equal to `frameCount` minus the first and last *frames*
	 */
	const backwardsFrameCount = forwardsFrameCount - 2;

	const frameCount = forwardsFrameCount + backwardsFrameCount;

	const spriteWidth = boo.width / forwardsFrameCount;

	const scratch = new Vector3();
</script>

<script lang="ts">
	import { createCanvasTexture } from "./createCanvasTexture";

	import boo from "@assets/boo.png";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";
	import { loadImage } from "@functions/loadImage";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		BoxGeometry,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		Sprite,
		SpriteMaterial,
		Vector3,
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let {
		autoRotate = true,
		canvasWidth = 1,
		canvasHeight = 1,
		aspect = canvasWidth / canvasHeight,
	} = $props();

	const booCanvas = new OffscreenCanvas(spriteWidth, boo.height);
	const booCanvasContext = booCanvas.getContext("2d");

	// the example can not work without the context so just throw and let the boundary handle it
	if (booCanvasContext === null) {
		throw new Error("texture context is null");
	}

	const canvasTexture = createCanvasTexture(booCanvas);

	const camera = new PerspectiveCamera();
	camera.position.setZ(3);

	const spriteMaterial = new SpriteMaterial({
		map: canvasTexture,
	});

	const sprite = new Sprite(spriteMaterial);
	sprite.position.setX(-1);

	const material = new MeshNormalMaterial();
	const geometry = new BoxGeometry();
	const mesh = new Mesh(geometry, material);
	mesh.position.setX(1);

	const scene = new Scene().add(sprite, mesh);

	$effect(() => {
		return () => {
			scene.remove(sprite, mesh);
			spriteMaterial.map = null;
			spriteMaterial.dispose();

			material.dispose();
			geometry.dispose();

			canvasTexture.dispose();
		};
	});

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const booImagePromise = loadImage(boo.src, boo.width, boo.height);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const controls = new OrbitControls(camera);

	controls.autoRotateSpeed = 10;
	controls.maxPolarAngle = 0.5 * Math.PI;
	controls.minPolarAngle = 0.5 * Math.PI;

	$effect(() => {
		controls.autoRotate = autoRotate;
	});

	let lastOffset: number;
	let canceled = false;
</script>

<canvas
	{@attach (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setSize(canvasWidth, canvasHeight);
		});

		$effect(() => {
			renderer.setPixelRatio(pixelRatio);
		});

		controls.connect(renderer.domElement);

		const render = () => {
			renderer.render(scene, camera);
		};

		controls.addEventListener("change", render);

		booImagePromise.then((image) => {
			if (canceled) return;

			renderer.setAnimationLoop(() => {
				if (controls.autoRotate) {
					controls.update();
				}

				scratch.subVectors(camera.position, sprite.position);

				// flip the position over the x-axis
				scratch.z *= -1;

				// in the xz-plane, the z part of the vector acts as the "y" argument of atan2
				const angle = Math.atan2(scratch.z, scratch.x) + Math.PI;

				let offset = Math.floor(frameCount * (angle / tau));

				const backwards = offset >= forwardsFrameCount;

				if (backwards) {
					offset = backwardsFrameCount - (offset % forwardsFrameCount);
				}

				if (lastOffset === offset) return;

				lastOffset = offset;

				const directionX = 1 - 2 * +backwards;

				booCanvasContext.resetTransform();
				booCanvasContext.scale(directionX, 1);

				booCanvasContext.clearRect(
					0,
					0,
					directionX * booCanvasContext.canvas.width,
					booCanvasContext.canvas.height,
				);

				booCanvasContext.drawImage(
					image,
					booCanvasContext.canvas.width * offset,
					0,
					spriteWidth,
					boo.height,
					0,
					0,
					directionX * spriteWidth,
					boo.height,
				);

				canvasTexture.needsUpdate = true;
			});
		});

		return () => {
			canceled = true;
			controls.removeEventListener("change", render);
			controls.disconnect();
			renderer.setAnimationLoop(null);
		};
	}}
>
</canvas>
