<script lang="ts">
	import type { LodLevel } from "./types";

	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		BufferGeometry,
		IcosahedronGeometry,
		LOD,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
	} from "three";

	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);

	const size = new Size();
	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const z = 5;
	const offset = 3;
	const distances = [z - offset, offset, z + offset];

	const levels: LodLevel[] = [];
	const material = new MeshNormalMaterial({
		wireframe: true,
	});

	const geometries: BufferGeometry[] = [];

	for (let i = 0, l = distances.length; i < l; i += 1) {
		const detail = l - i - 1;
		const geometry = new IcosahedronGeometry(1, detail);
		geometries.push(geometry);
		const object = new Mesh(geometry, material);
		const distance = distances[i];
		levels.push({
			object,
			distance,
		});
	}

	const lod = levels.reduce((lod, { distance, hysteresis, object }) => {
		return lod.addLevel(object, distance, hysteresis);
	}, new LOD());

	const scene = new Scene().add(lod);

	$effect(() => {
		return () => {
			scene.remove(lod);

			for (const distance of distances) {
				lod.removeLevel(distance);
			}

			for (const geometry of geometries) {
				geometry.dispose();
			}

			material.dispose();
		};
	});

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);
</script>

<div bind:clientWidth={size.width}>
	<canvas
		{@attach renderer((renderer) => {
			$effect(() => {
				renderer.setSize(size.width, size.height);
			});

			$effect(() => {
				renderer.setPixelRatio(pixelRatio);
			});

			renderer.setAnimationLoop((time) => {
				renderer.render(scene, camera);

				time *= 1 / 1000;
				camera.position.setZ(1 + z + 1.5 * offset * Math.sin(0.75 * time));
			});

			return () => {
				renderer.setAnimationLoop(null);
			};
		})}
	>
	</canvas>
</div>
