<script lang="ts">
	import { createFloorMesh } from "./createFloorMesh";
	import { createShadowGradient } from "./createShadowGradient";
	import { createShadowMaterial } from "./createShadowMaterial";
	import { createShadowMesh } from "./createShadowMesh";
	import { createSphereMesh } from "./createSphereMesh";
	import Pane from "./pane.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import type { CreateRendererAttachment } from "@types";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		Group,
		MathUtils,
		PerspectiveCamera,
		Scene,
		WebGLRenderer,
	} from "three";
	import type { WebGLRendererParameters } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let { backgroundColor = "rgba(0,0,0,0)", shadowColor = "black" } = $props();

	let canvasWidth = $state(1);
	let aspect = $state(4 / 3);

	const canvasHeight = $derived(canvasWidth / aspect);

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

	const gradient = $derived(
		createShadowGradient(context, backgroundColor, shadowColor),
	);

	$effect(() => {
		context.fillStyle = gradient;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	});

	const shadowMaterial = createShadowMaterial(textureCanvas);

	const sphereRadius = 1;
	const { dispose: disposeShadow, mesh: shadowMesh } = createShadowMesh(
		shadowMaterial,
		2 * sphereRadius,
	);

	// offset in the z since the floor group will be rotated so that z is up
	shadowMesh.position.z = 0.01;

	const floorSize = 6;
	const { dispose: disposeFloor, mesh: floorMesh } = createFloorMesh(floorSize);

	const group = new Group().add(shadowMesh, floorMesh);
	group.rotateX(-1 * 0.5 * Math.PI);

	const positionYInitial = 2.5;
	const { dispose: disposeSphere, mesh: sphereMesh } =
		createSphereMesh(sphereRadius);

	const scene = new Scene().add(sphereMesh, group);

	$effect(() => {
		return () => {
			for (const child of scene.children) child.removeFromParent();
			for (const child of group.children) child.removeFromParent();

			disposeSphere();
			disposeFloor();
			disposeShadow();
			shadowMaterial.dispose();
		};
	});

	const camera = new PerspectiveCamera();
	camera.position.setScalar(5);
	camera.lookAt(sphereMesh.position);
	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const controls = new OrbitControls(camera);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const speed = 1 / 1000;

	let rendererParameters = $state<WebGLRendererParameters>({
		antialias: true,
	});

	const createAttachment: CreateRendererAttachment = (rendererParameters) => {
		return (canvas) => {
			const renderer = new WebGLRenderer({ canvas, ...rendererParameters });

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(canvasWidth, canvasHeight);
				render();
			});

			$effect(() => {
				renderer.setPixelRatio(pixelRatio);
				render();
			});

			renderer.setAnimationLoop((time) => {
				time *= speed;
				const sin = Math.sin(time);
				sphereMesh.position.y = positionYInitial + sin;

				// convert sin's -1 -> 1 interval to lerp's intervial of 0 -> 1
				const t = 0.5 * (1 + sin);

				shadowMaterial.opacity = MathUtils.lerp(1, 0, t);
				render();
			});

			controls.connect(renderer.domElement);
			controls.addEventListener("change", render);

			return () => {
				controls.disconnect();
				controls.removeEventListener("change", render);
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
		<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
			<Pane bind:aspect />
		</div>
		<canvas {@attach createAttachment(rendererParameters)}></canvas>
	</div>

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>
