<script lang="ts">
	import {
		State,
		createRendererAttachment,
	} from "@attachments/createRendererAttachment.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
	} from "three";

	const distance = 5;
	const halfDistance = 0.5 * distance;

	const s = new State();

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

	const camera = new PerspectiveCamera();
	camera.translateZ(10);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(s.aspect);
	});

	$effect(() => {
		return () => {
			scene.remove(...meshes);
			for (const material of materials) material.dispose();
			geometry.dispose();
		};
	});

	const rotationAmount = (1 / 100) * Math.PI;

	s.withRenderer = (renderer) => {
		renderer.setAnimationLoop(() => {
			mesh.rotateY(rotationAmount);
			flatShadingMesh.rotateY(rotationAmount);
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
