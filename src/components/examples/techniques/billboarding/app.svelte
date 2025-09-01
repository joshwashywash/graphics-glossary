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

	const spriteWidth = booImageMetadata.width / forwardsFrameCount;
</script>

<script lang="ts">
	import { createCanvasTexture } from "./createCanvasTexture";

	import booImageMetadata from "@assets/boo.png";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";
	import { loadImage } from "@functions/loadImage";

	import type { CreateRendererAttachment } from "@types";
	import { Checkbox, Pane } from "svelte-tweakpane-ui";
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

	/** the width of the image minus the width of the first and last sprites */
	const extensionWidth = booImageMetadata.width - 2 * spriteWidth;

	const booCanvas = new OffscreenCanvas(
		booImageMetadata.width + extensionWidth,
		booImageMetadata.height,
	);
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
	camera.translateZ(4);

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

	let rendererParameters = $state<WebGLRendererParameters>({
		antialias: true,
	});

	const billboarding: CreateRendererAttachment = (rendererParameters) => {
		let lastOffset: number;

		const scratch = new Vector3();

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
			<Pane position="inline">
				<Checkbox
					bind:value={useAutoRotate}
					label="auto rotate camera"
				/>
			</Pane>
		</div>
	</div>

	{#snippet pending()}
		<p>loading</p>
	{/snippet}

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>
