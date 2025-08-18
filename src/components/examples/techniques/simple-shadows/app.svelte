<script lang="ts">
	import { createFloorMesh } from "./createFloorMesh";
	import { createShadowMesh } from "./createShadowMesh";
	import { createSphereMesh } from "./createSphereMesh";
	import { drawShadow } from "./drawShadow";
	import Pane from "./pane.svelte";

	import { attachment } from "@attachments/attachment.svelte";
	import type { WithRenderer } from "@attachments/attachment.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import { Group, MathUtils, PerspectiveCamera, Scene } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let canvasWidth = $state(1);
	let aspect = $state(16 / 9);

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

	drawShadow(context);

	const sphereRadius = 1;
	const {
		dispose: disposeShadow,
		material: shadowMaterial,
		mesh: shadowMesh,
	} = createShadowMesh(textureCanvas, 2 * sphereRadius);

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

	const canvasHeight = $derived(canvasWidth / aspect);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const speed = 1 / 1000;

	const withRenderer: WithRenderer = (renderer) => {
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
			renderer.setAnimationLoop(null);
			controls.disconnect();
			controls.removeEventListener("change", render);
		};
	};
</script>

<svelte:boundary>
	<div bind:clientWidth={canvasWidth}>
		<canvas {@attach attachment(withRenderer)}></canvas>
	</div>

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>

<div class="not-content">
	<Pane bind:aspect />
</div>
