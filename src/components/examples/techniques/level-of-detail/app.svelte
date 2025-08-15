<script lang="ts">
	import type { LodLevel } from "./types";

	import type { WithRenderer } from "@attachments/attachment.svelte";
	import { attachment } from "@attachments/attachment.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { List, Pane } from "svelte-tweakpane-ui";
	import type { ListOptions } from "svelte-tweakpane-ui";
	import {
		BufferGeometry,
		IcosahedronGeometry,
		LOD,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
	} from "three";

	let canvasWidth = $state(1);
	let aspect = $state(16 / 9);

	const canvasHeight = $derived(canvasWidth / aspect);

	const aspects: ListOptions<number> = {
		"3:2": 3 / 2,
		"4:3": 4 / 3,
		"16:9": 16 / 9,
	} as const;

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

	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);

	// because we're rendering in a loop, no need to render when some things are changed, they will just be picked up in the next animation loop

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const withRenderer: WithRenderer = (renderer) => {
		$effect(() => {
			renderer.setSize(canvasWidth, canvasHeight);
		});

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

<div bind:clientWidth={canvasWidth}>
	<canvas {@attach attachment(withRenderer)}></canvas>
</div>

<div class="not-content">
	<Pane
		position="inline"
		title="level-of-detail"
	>
		<List
			bind:value={aspect}
			options={aspects}
			label="aspect ratio"
		/>
	</Pane>
</div>
