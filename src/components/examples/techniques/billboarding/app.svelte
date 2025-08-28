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
	import Pane from "./pane.svelte";

	import boo from "@assets/boo.png";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";
	import { loadImage } from "@functions/loadImage";

	import type { CreateRendererAttachment } from "@types";
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
	import type { WebGLRendererParameters } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	const booCanvas = new OffscreenCanvas(spriteWidth, boo.height);
	const booCanvasContext = booCanvas.getContext("2d");

	// the example can not work without the context so just throw and let the boundary handle it
	if (booCanvasContext === null) {
		throw new Error("texture context is null");
	}

	let canvasWidth = $state(1);
	let aspect = $state(4 / 3);
	const canvasHeight = $derived(canvasWidth / aspect);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	let useAutoRotate = $state(true);

	const canvasTexture = createCanvasTexture(booCanvas);

	const spriteMaterial = new SpriteMaterial({
		map: canvasTexture,
	});

	const sprite = new Sprite(spriteMaterial);
	sprite.translateX(-1);

	const material = new MeshNormalMaterial();
	const geometry = new BoxGeometry();
	const mesh = new Mesh(geometry, material);
	mesh.translateX(1);

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

	const camera = new PerspectiveCamera();
	camera.translateZ(3);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const controls = new OrbitControls(camera);
	$effect(() => {
		controls.autoRotate = useAutoRotate;
	});

	controls.autoRotateSpeed = 10;
	controls.maxPolarAngle = 0.5 * Math.PI;
	controls.minPolarAngle = 0.5 * Math.PI;

	let lastOffset: number;
	let canceled = false;

	const booImagePromise = loadImage(boo.src, boo.width, boo.height);

	let rendererParameters = $state<WebGLRendererParameters>({
		antialias: true,
	});

	const billboarding: CreateRendererAttachment = (rendererParameters) => {
		return (canvas) => {
			const renderer = new WebGLRenderer({ canvas, ...rendererParameters });

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(canvasWidth, canvasHeight);
			});

			$effect(() => {
				renderer.setPixelRatio(pixelRatio);
			});

			booImagePromise.then((image) => {
				if (canceled) return;

				renderer.setAnimationLoop(() => {
					if (controls.autoRotate) {
						controls.update();
						render();
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

			controls.addEventListener("change", render);
			controls.connect(renderer.domElement);

			return () => {
				canceled = true;
				renderer.setAnimationLoop(null);
				controls.removeEventListener("change", render);
				controls.disconnect();
				renderer.dispose();
			};
		};
	};
</script>

<svelte:boundary>
	<div
		bind:clientWidth={canvasWidth}
		class="sm:relative"
	>
		<canvas {@attach billboarding(rendererParameters)}></canvas>
		<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
			<Pane bind:useAutoRotate />
		</div>
	</div>

	{#snippet pending()}
		<p>loading</p>
	{/snippet}

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>
