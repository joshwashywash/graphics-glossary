<script lang="ts">
	import type { WithRenderer } from "@attachments/renderer.svelte";
	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { add } from "@functions/add.svelte";
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

	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const z = 5;
	const offset = 3;
	const distances = [z - offset, offset, z + offset];

	const lod = new LOD();
	const geometries: IcosahedronGeometry[] = [];

	const material = new MeshNormalMaterial({
		wireframe: true,
	});

	for (let i = 0, l = distances.length; i < l; i += 1) {
		const detail = l - i - 1;
		const geometry = new IcosahedronGeometry(1, detail);
		geometries.push(geometry);
		const mesh = new Mesh(geometry, material);
		mesh.matrixAutoUpdate = false;
		lod.addLevel(mesh, distances[i]);
	}

	$effect(() => {
		return () => {
			for (const geometry of geometries) {
				geometry.dispose();
			}
			material.dispose();
		};
	});

	const scene = new Scene();
	add(
		() => scene,
		() => lod,
	);

	const withRenderer: WithRenderer = (renderer) => {
		renderer.setAnimationLoop((time) => {
			renderer.render(scene, camera);

			time *= 1 / 1000;
			camera.position.setZ(1 + z + 1.5 * offset * Math.sin(0.75 * time));
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
