<script lang="ts">
	import createLOD from "./createLOD";
	import renderer from "@utils/attachments/renderer.svelte";
	import type { Setup } from "@utils/attachments/renderer.svelte";
	import type { LODItem } from "./createLOD";
	import { MeshNormalMaterial, PerspectiveCamera, Scene } from "three";

	const material = new MeshNormalMaterial({
		wireframe: true,
	});

	const z = 5;
	const offset = 3;
	const items: LODItem[] = [
		{
			distance: z - offset,
			material,
		},
		{
			distance: z,
			material,
		},
		{
			distance: z + offset,
			material,
		},
	];

	const { lod, meshes } = createLOD(items);

	const scene = new Scene().add(lod);

	$effect(() => {
		return () => {
			for (const mesh of meshes) {
				mesh.geometry.dispose();
			}
			material.dispose();
			scene.remove(lod);
		};
	});

	const camera = new PerspectiveCamera();

	camera.position.set(0, 0, 1 + z);

	const setup: Setup = (renderer) => {
		const width = renderer.domElement.parentElement?.clientWidth ?? 1;
		const height = 0.5 * width;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);

		renderer.setAnimationLoop((time) => {
			renderer.render(scene, camera);

			time *= 1 / 1000;
			const z = (1 + offset) * Math.sin(0.75 * time);
			lod.position.setZ(z);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div>
	<canvas {@attach renderer(setup)}></canvas>
</div>
