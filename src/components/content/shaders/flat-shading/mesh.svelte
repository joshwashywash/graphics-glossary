<script lang="ts">
	import { Mesh, MeshNormalMaterial, Object3D, SphereGeometry } from "three";

	let {
		flatShading = true,
		parent,
	}: {
		flatShading: boolean;
		parent: Object3D | (() => Object3D);
	} = $props();

	const geometry = new SphereGeometry(1, 16, 8);
	const material = new MeshNormalMaterial();

	$effect(() => {
		material.flatShading = flatShading;
		material.needsUpdate = true;
	});

	const mesh = new Mesh(geometry, material);

	const getParent = $derived(
		typeof parent === "function" ? parent : () => parent,
	);

	$effect(() => {
		const parent = getParent();

		parent.add(mesh);

		return () => {
			parent.remove(mesh);
		};
	});

	$effect(() => {
		return () => {
			geometry.dispose();
			material.dispose();
		};
	});
</script>
