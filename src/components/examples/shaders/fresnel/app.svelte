<script
	lang="ts"
	module
>
	const rotationAmount = (1 / 180) * Math.PI;
</script>

<script lang="ts">
	import type { Uniforms } from "./FresnelMaterial";
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";
	import { createAttachment } from "./pane";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		Mesh,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
		WebGLRenderer,
	} from "three";

	const uniforms = createUniforms();

	const material = new FresnelMaterial(uniforms);

	const geometry = new TorusKnotGeometry();

	onCleanup(() => {
		material.dispose();
		geometry.dispose();
	});

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera();
	camera.translateZ(5);

	const createParams = (uniforms: Uniforms) => {
		return {
			get baseColor() {
				return `#${uniforms.uBaseColor.value.getHexString()}`;
			},
			set baseColor(value) {
				uniforms.uBaseColor.value.setStyle(value);
			},
			get fresnelColor() {
				return `#${uniforms.uFresnelColor.value.getHexString()}`;
			},
			set fresnelColor(value) {
				uniforms.uFresnelColor.value.setStyle(value);
			},
			get power() {
				return uniforms.uPower.value;
			},
			set power(value: number) {
				uniforms.uPower.value = value;
			},
		};
	};

	const params = createParams(uniforms);

	const pane = createAttachment(params);

	let clientWidth = $state(1);
	let clientHeight = $state(1);

	const aspect = $derived(clientWidth / clientHeight);
</script>

<div class="relative">
	<div
		class="absolute top-2 right-2 not-content"
		{@attach pane}
	></div>

	<canvas
		class="w-full aspect-square"
		bind:clientWidth
		bind:clientHeight
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(clientWidth, clientHeight, false);
				render();
			});

			$effect(() => {
				camera.aspect = aspect;
				camera.updateProjectionMatrix();
				render();
			});

			renderer.setAnimationLoop(() => {
				mesh.rotateY(rotationAmount);
				render();
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
