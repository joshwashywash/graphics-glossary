<script lang="ts">
	import { createLOD } from "./createLOD";

	import { createRendererAttachment } from "@attachments/createRendererAttachment.svelte";

	import { Size } from "@classes/Size.svelte";

	import { PerspectiveCamera, Scene } from "three";

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

	const canvasSize = new Size();

	$effect(() => {
		camera.aspect = canvasSize.aspect;
		camera.updateProjectionMatrix();
	});

	const speed = 1 / 1000;

	const levelOfDetialAttachment = createRendererAttachment({
		getRendererParameters: () => ({
			antialias: true,
		}),
		getWithRenderer: () => (renderer) => {
			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
			});

			renderer.setAnimationLoop((time) => {
				time *= speed;
				camera.position.z = 1 + z + 1.5 * offset * Math.sin(0.75 * time);

				renderer.render(scene, camera);
			});

			return () => {
				renderer.setAnimationLoop(null);
			};
		},
	});
</script>

<div bind:clientWidth={canvasSize.width}>
	<canvas {@attach levelOfDetialAttachment}></canvas>
</div>
