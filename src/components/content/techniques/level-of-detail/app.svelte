<script lang="ts">
	import Size from "@classes/Size.svelte";
	import renderer from "@attachments/renderer.svelte";
	import type { Setup } from "@attachments/renderer.svelte";
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

	const size = new Size();

	$effect(() => {
		camera.aspect = size.ratio;
		camera.updateProjectionMatrix();
	});

	const setup: Setup = (renderer) => {
		$effect(() => {
			renderer.setSize(size.width, size.height);
		});

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

<div bind:clientWidth={size.width}>
	<canvas {@attach renderer(setup)}></canvas>
</div>
