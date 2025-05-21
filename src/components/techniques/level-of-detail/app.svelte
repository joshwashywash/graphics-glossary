<script lang="ts">
	import renderer from "@utils/attachments/renderer.svelte";
	import type { Init } from "@utils/attachments/renderer.svelte";
	import { MeshNormalMaterial, PerspectiveCamera, Scene } from "three";
	import createLOD from "./createLOD";
	import type { LODItem } from "./createLOD";

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

	const init: Init = (renderer) => {
		const width = renderer.domElement.parentElement?.clientWidth ?? 1;
		const height = 0.5 * width;

		const aspect = width / height;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);

		renderer.setAnimationLoop((time) => {
			renderer.render(scene, camera);

			const z = (1 + offset) * Math.sin((3 / 4) * (time / 1000));
			lod.position.setZ(z);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div>
	<canvas {@attach renderer(init)}></canvas>
</div>
