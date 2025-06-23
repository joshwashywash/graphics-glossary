<script lang="ts">
	import { createMesh } from "./createMesh";
	import Pane from "./pane.svelte";

	import type { WithRenderer } from "@attachments/renderer.svelte";
	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { PerspectiveCamera, Scene } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let autoRotate = $state(true);
	let flatShading = $state(true);

	const scene = new Scene();
	const addToScene = createAdd(() => scene);

	const size = new Size();

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 3);
	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const controls = new OrbitControls(camera);
	$effect(() => {
		controls.autoRotate = autoRotate;
	});

	const withRenderer: WithRenderer = (renderer) => {
		controls.connect(renderer.domElement);

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
			controls.disconnect();
		};
	};

	const { dispose, mesh, updateFlatShading } = createMesh();
	addToScene(() => mesh);

	$effect(() => {
		return dispose;
	});

	$effect(() => {
		updateFlatShading(flatShading);
	});
</script>

<div bind:clientWidth={size.width}>
	<canvas
		{@attach renderer(
			() => size.width,
			() => size.height,
			withRenderer,
		)}
	>
	</canvas>
</div>

<div class="not-content">
	<Pane
		bind:autoRotate
		bind:flatShading
	/>
</div>
