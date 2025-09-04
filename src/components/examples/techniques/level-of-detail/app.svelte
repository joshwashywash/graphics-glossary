<script lang="ts">
	import { createLOD } from "./createLOD";

	import {
		State,
		createRendererAttachment,
	} from "@attachments/createRendererAttachment.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

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
	const updateCameraAspect = createUpdateCameraAspect(camera);

	const s = new State();
	$effect(() => {
		updateCameraAspect(s.aspect);
	});

	const speed = 1 / 1000;

	s.withRenderer = (renderer) => {
		renderer.setAnimationLoop((time) => {
			renderer.render(scene, camera);

			time *= speed;
			camera.position.z = 1 + z + 1.5 * offset * Math.sin(0.75 * time);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div bind:clientWidth={s.canvasWidth}>
	<canvas {@attach createRendererAttachment(s)}></canvas>
</div>
