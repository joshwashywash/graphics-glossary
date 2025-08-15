<script lang="ts">
	import { createFloorMesh } from "./createFloorMesh";
	import { createShadowMesh } from "./createShadowMesh";
	import { createSphereMesh } from "./createSphereMesh";
	import { drawShadow } from "./drawShadow";

	import { attachment } from "@attachments/attachment.svelte";
	import type { WithRenderer } from "@attachments/attachment.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { List, Pane } from "svelte-tweakpane-ui";
	import type { ListOptions } from "svelte-tweakpane-ui";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import { Group, PerspectiveCamera, Scene } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let canvasWidth = $state(1);
	let aspect = $state(16 / 9);

	const textureCanvasSize = 128;
	const textureCanvas = new OffscreenCanvas(
		textureCanvasSize,
		textureCanvasSize,
	);

	const context = textureCanvas.getContext("2d");
	// can't really do anything if the conext is null so just let the boundary catch the error
	if (context === null) {
		throw new Error("canvas texture context is null");
	}

	drawShadow(context);

	const sphereRadius = 1;
	const { dispose: disposeShadow, mesh: shadowMesh } = createShadowMesh(
		textureCanvas,
		2 * sphereRadius,
	);

	const floorSize = 6;
	const { dispose: disposeFloor, mesh: floorMesh } = createFloorMesh(floorSize);

	const group = new Group().add(shadowMesh, floorMesh);
	group.rotateX(-1 * 0.5 * Math.PI);

	const { dispose: disposeSphere, mesh: sphereMesh } =
		createSphereMesh(sphereRadius);
	sphereMesh.position.y = 2;

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
	camera.position.setScalar(4);
	camera.lookAt(sphereMesh.position);
	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const canvasHeight = $derived(canvasWidth / aspect);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const controls = new OrbitControls(camera);

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

		controls.connect(renderer.domElement);

		controls.addEventListener("change", render);

		return () => {
			controls.disconnect();
			controls.removeEventListener("change", render);
		};
	};

	const aspects: ListOptions<number> = {
		"3:2": 3 / 2,
		"4:3": 4 / 3,
		"16:9": 16 / 9,
	} as const;
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
	<Pane
		position="inline"
		title="level-of-detail"
	>
		<List
			bind:value={aspect}
			options={aspects}
			label="aspect ratio"
		/>
	</Pane>
</div>
