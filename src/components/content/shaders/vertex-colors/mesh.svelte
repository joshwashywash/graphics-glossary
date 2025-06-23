<script
	module
	lang="ts"
>
	// the default box geometry positions range from -0.5 -> 0.5
	// `f` remaps this to 0 -> 1
	const f = (n: number): number => 0.5 + n;
	const map = {
		x: f,
		y: f,
		z: f,
	};

	const materialParameters: MeshBasicMaterialParameters = {
		vertexColors: true,
	};
</script>

<script lang="ts">
	import createColorAttribute from "./createColorAttribute";

	import { add } from "@functions/add.svelte";

	import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";
	import type { MeshBasicMaterialParameters } from "three";

	let {
		parent,
	}: {
		parent: Object3D;
	} = $props();

	const geometry = new BoxGeometry();
	const positionAttribute = geometry.getAttribute("position");

	const colorAttribute = createColorAttribute(positionAttribute, map);

	geometry.setAttribute("color", colorAttribute);

	const material = new MeshBasicMaterial(materialParameters);

	$effect(() => {
		return () => {
			material.dispose();
			geometry.dispose();
		};
	});

	const mesh = new Mesh(geometry, material);

	add(
		() => parent,
		() => mesh,
	);
</script>
