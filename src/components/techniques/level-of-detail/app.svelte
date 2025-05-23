<script lang="ts">
	import renderer from "@utils/attachments/renderer.svelte";
	import type { Setup } from "@utils/attachments/renderer.svelte";
	import {
		IcosahedronGeometry,
		LOD,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
	} from "three";

	const material = new MeshNormalMaterial({
		wireframe: true,
	});

	const z = 5;
	const offset = 3;
	const distances = [z - offset, offset, z + offset];

	const lod = new LOD();
	const meshes: Mesh[] = [];

	for (let i = 0, l = distances.length; i < l; i += 1) {
		const detail = l - i - 1;
		const geometry = new IcosahedronGeometry(1, detail);
		const mesh = new Mesh(geometry, material);
		// these meshes won't ever change position, scale, or rotation so there's no need to update their matrices every frame
		mesh.matrixAutoUpdate = false;
		meshes.push(mesh);
		lod.addLevel(mesh, distances[i]);
	}

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
		const width = renderer.domElement.clientWidth;
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

<canvas
	class="w-full"
	{@attach renderer(setup)}
>
</canvas>
