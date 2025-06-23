<script lang="ts">
	import { createLOD } from "./createLOD";

	import type { WithRenderer } from "@attachments/renderer.svelte";
	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { PerspectiveCamera, Scene } from "three";

	const size = new Size();

	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const z = 5;
	const offset = 3;
	const distances = [z - offset, offset, z + offset];

	const { dispose, lod } = createLOD(distances);
	$effect(() => {
		return dispose;
	});

	const scene = new Scene();
	const addToScene = createAdd(() => scene);
	addToScene(() => lod);

	const withRenderer: WithRenderer = (renderer) => {
		renderer.setAnimationLoop((time) => {
			renderer.render(scene, camera);

			time *= 1 / 1000;
			camera.position.setZ(1 + z + 1.5 * offset * Math.sin(0.75 * time));
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};
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
