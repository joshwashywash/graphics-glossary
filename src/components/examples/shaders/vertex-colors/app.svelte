<script lang="ts">
	import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";

	import {
		State,
		createRendererAttachment,
	} from "@attachments/createRendererAttachment.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import {
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		Vector3,
	} from "three";

	const s = new State();

	const geometry = new VertexColorsBoxGeometry();
	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();
		};
	});

	const camera = new PerspectiveCamera();
	camera.translateZ(3);

	const updateCameraAspect = createUpdateCameraAspect(camera);
	$effect(() => {
		updateCameraAspect(s.aspect);
	});

	const rotationAmount = (1 / 120) * Math.PI;

	const axis = new Vector3(1, 1, -1).normalize();

	s.withRenderer = (renderer) => {
		renderer.setAnimationLoop(() => {
			mesh.rotateOnAxis(axis, rotationAmount);
			renderer.render(scene, camera);
		});
		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div bind:clientWidth={s.canvasWidth}>
	<canvas {@attach createRendererAttachment(s)}></canvas>
</div>
