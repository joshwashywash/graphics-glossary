<script lang="ts">
	import fragmentShader from "./fragment.glsl?raw";
	import vertexShader from "./vertex.glsl?raw";

	import { add } from "@functions/add.svelte";

	import {
		Color,
		Mesh,
		Object3D,
		ShaderMaterial,
		TorusGeometry,
		Uniform,
	} from "three";

	let {
		baseColor,
		fresnelColor,
		parent,
		power,
	}: {
		baseColor: string;
		fresnelColor: string;
		parent: Object3D;
		power: number;
	} = $props();

	const uBaseColor = new Uniform(new Color());
	const uFresnelColor = new Uniform(new Color());
	const uPower = new Uniform(1);

	$effect(() => {
		uBaseColor.value.set(baseColor);
	});

	$effect(() => {
		uFresnelColor.value.set(fresnelColor);
	});

	$effect(() => {
		uPower.value = power;
	});

	const geometry = new TorusGeometry();
	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
		uniforms: {
			uBaseColor,
			uFresnelColor,
			uPower,
		},
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
