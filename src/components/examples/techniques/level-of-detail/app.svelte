<script lang="ts">
	import { createLOD } from "./createLOD";
	import Pane from "./pane.svelte";

	import type { WithRenderer } from "@attachments/attachment.svelte";
	import { attachment } from "@attachments/attachment.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { PerspectiveCamera, Scene } from "three";

	let canvasWidth = $state(1);
	let aspect = $state(16 / 9);

	const canvasHeight = $derived(canvasWidth / aspect);

	const z = 5;
	const offset = 3;
	const distances = [z - offset, offset, z + offset];

	const { lod, dispose: disposeLOD } = createLOD(distances);

	const scene = new Scene().add(lod);

	$effect(() => {
		return () => {
			scene.remove(lod);

			disposeLOD();
		};
	});

	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const withRenderer: WithRenderer = (renderer) => {
		$effect(() => {
			renderer.setSize(canvasWidth, canvasHeight);
		});

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

<div bind:clientWidth={canvasWidth}>
	<canvas {@attach attachment(withRenderer)}></canvas>
</div>

<div class="not-content">
	<Pane bind:aspect />
</div>
