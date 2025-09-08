<script lang="ts">
	import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";

	import { Size } from "@classes/Size.svelte";

	import {
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		Vector3,
		WebGLRenderer,
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
</script>

<div bind:clientWidth={canvasSize.width}>
	<canvas
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				canvas,
				antialias: true,
			});

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
			});

			renderer.setAnimationLoop(() => {
				mesh.rotateOnAxis(axis, rotationAmount);
				renderer.render(scene, camera);
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	></canvas>
</div>
