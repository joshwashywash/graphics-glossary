<script lang="ts">
	import type { Uniforms } from "./FresnelMaterial";
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";
	import { createAttachment } from "./pane";

	import Canvas from "@components/canvas.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import type { WebGLRendererParameters } from "three";
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

	const rotationAmount = (1 / 180) * Math.PI;

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

	const loop = (renderer: WebGLRenderer) => {
		mesh.rotateY(rotationAmount);
		renderer.render(scene, camera);
	};

	const onRendererResize = (renderer: WebGLRenderer) => {
		const { clientWidth, clientHeight } = renderer.domElement;
		camera.aspect = clientWidth / clientHeight;
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
	};

	const rendererParams: WebGLRendererParameters = {
		antialias: true,
	};
</script>

<div class="relative">
	<div
		class="absolute top-2 right-2 not-content"
		{@attach pane}
	></div>
	<Canvas
		class="w-full aspect-square"
		{loop}
		{onRendererResize}
		{rendererParams}
	/>
</div>
