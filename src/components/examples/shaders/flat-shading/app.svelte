<script lang="ts">
	import { Size } from "@classes/Size.svelte";

	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
		WebGLRenderer,
	} from "three";

	const distance = 5;
	const halfDistance = 0.5 * distance;

	const geometry = new TorusKnotGeometry();

	const material = new MeshNormalMaterial();
	const flatShadingMaterial = material.clone();
	flatShadingMaterial.flatShading = true;

	const materials = [material, flatShadingMaterial];

	const mesh = new Mesh(geometry, material);
	mesh.translateX(-1 * halfDistance);

	const flatShadingMesh = new Mesh(geometry, flatShadingMaterial);
	flatShadingMesh.translateX(halfDistance);

	const meshes = [mesh, flatShadingMesh];

	const scene = new Scene().add(...meshes);

	$effect(() => {
		return () => {
			scene.remove(...meshes);
			for (const material of materials) material.dispose();
			geometry.dispose();
		};
	});

	const camera = new PerspectiveCamera();
	camera.translateZ(10);

	const canvasSize = new Size();

	$effect(() => {
		camera.aspect = canvasSize.aspect;
		camera.updateProjectionMatrix();
	});

	const rotationAmount = (1 / 180) * Math.PI;
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
				for (const mesh of meshes) mesh.rotateY(rotationAmount);
				renderer.render(scene, camera);
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	></canvas>
</div>
