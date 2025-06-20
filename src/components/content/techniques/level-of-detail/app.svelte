<script lang="ts">
	import type { WithRenderer } from "@attachments/renderer.svelte";
	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import {
		IcosahedronGeometry,
		LOD,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
	} from "three";

	const size = new Size();

	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);
	camera.position.set(0, 0, 3);

	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const z = 5;
	camera.position.set(0, 0, 1 + z);

	const material = new MeshNormalMaterial({
		wireframe: true,
	});

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
		};
	});

	const scene = new Scene();
	const addToScene = createAdd(() => scene);

	addToScene(() => lod);

	const withRenderer: WithRenderer = (renderer) => {
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
	<canvas
		{@attach renderer(
			() => size.width,
			() => size.height,
			withRenderer,
		)}
	>
	</canvas>
</div>
