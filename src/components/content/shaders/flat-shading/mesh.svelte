<script lang="ts">
	import { add } from "@functions/add.svelte";

	import { Mesh, MeshNormalMaterial, Object3D, SphereGeometry } from "three";

	let {
		flatShading = true,
		parent,
	}: {
		flatShading: boolean;
		parent: Object3D;
	} = $props();

	const geometry = new SphereGeometry(1, 16, 8);
	const material = new MeshNormalMaterial();

	$effect(() => {
		material.flatShading = flatShading;
		material.needsUpdate = true;
	});

	const mesh = new Mesh(geometry, material);

	add(
		() => parent,
		() => mesh,
	);

	$effect(() => {
		return () => {
			geometry.dispose();
			material.dispose();
		};
	});
</script>
