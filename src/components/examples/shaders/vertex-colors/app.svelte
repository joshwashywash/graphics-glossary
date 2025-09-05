<script lang="ts">
	import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";

	import { createRendererAttachment } from "@attachments/createRendererAttachment.svelte";

	import { Size } from "@classes/Size.svelte";

	import {
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		Vector3,
	} from "three";

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

	const canvasSize = new Size();
	$effect(() => {
		camera.aspect = canvasSize.aspect;
		camera.updateProjectionMatrix();
	});

	const rotationAmount = (1 / 120) * Math.PI;

	const axis = new Vector3(1, 1, -1).normalize();

	const vertexColorsAttachment = createRendererAttachment({
		getRendererParameters: () => ({ antialias: true }),
		getWithRenderer: () => (renderer) => {
			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
			});

			renderer.setAnimationLoop(() => {
				mesh.rotateOnAxis(axis, rotationAmount);
				renderer.render(scene, camera);
			});

			return () => {
				renderer.setAnimationLoop(null);
			};
		},
	});
</script>

<div bind:clientWidth={canvasSize.width}>
	<canvas {@attach vertexColorsAttachment}></canvas>
</div>
