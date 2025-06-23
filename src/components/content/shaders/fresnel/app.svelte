<script lang="ts">
	import Mesh from "./mesh.svelte";
	import Pane from "./pane.svelte";

	import type { WithRenderer } from "@attachments/renderer.svelte";
	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { PerspectiveCamera, Scene } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let autoRotate = $state(true);

	let baseColor = $state("#000000");
	let fresnelColor = $state("#ffffff");
	let power = $state(1);

	const scene = new Scene();

	const size = new Size();

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 4);
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
</script>

<Mesh
	parent={scene}
	{baseColor}
	{fresnelColor}
	{power}
/>

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
		bind:baseColor
		bind:fresnelColor
		bind:power
	/>
</div>
