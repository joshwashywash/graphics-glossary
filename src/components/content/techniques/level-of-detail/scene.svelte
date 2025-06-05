<script lang="ts">
	import { getAdd } from "@contexts/add";
	import { getSize } from "@contexts/size";
	import { getWithRenderer } from "@contexts/withRenderer";

	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import { IcosahedronGeometry, LOD, Mesh, MeshNormalMaterial } from "three";

	const material = new MeshNormalMaterial({
		wireframe: true,
	});

	$effect(() => {
		return () => {
			material.dispose();
		};
	});

	const size = getSize();

	const z = 5;
	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 1 + z);

	const offset = 3;
	const distances = [z - offset, offset, z + offset];

	const lod = new LOD();
	const meshes: Mesh[] = [];

	for (let i = 0, l = distances.length; i < l; i += 1) {
		const detail = l - i - 1;
		const geometry = new IcosahedronGeometry(1, detail);
		const mesh = new Mesh(geometry, material);
		mesh.matrixAutoUpdate = false;
		meshes.push(mesh);
		lod.addLevel(mesh, distances[i]);
	}

	$effect(() => {
		return () => {
			for (const mesh of meshes) {
				mesh.geometry.dispose();
			}
			material.dispose();
			scene.remove(lod);
		};
	});

	const add = getAdd();

	const scene = add(lod);

	const withRenderer = getWithRenderer();

	withRenderer((renderer) => {
		renderer.setAnimationLoop((time) => {
			renderer.render(scene, camera);

			time *= 1 / 1000;
			const z = (1 + offset) * Math.sin(0.75 * time);
			lod.position.setZ(z);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	});
</script>
