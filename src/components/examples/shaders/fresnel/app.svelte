<script lang="ts">
	import type { Uniforms } from "./FresnelMaterial";
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";
	import { createAttachment } from "./pane";

	import { Size } from "@classes/Size.svelte";

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
	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			material.dispose();
			geometry.dispose();
		};
	});

	const canvasSize = new Size();

	const camera = new PerspectiveCamera();
	camera.translateZ(5);

	$effect(() => {
		camera.aspect = canvasSize.aspect;
		camera.updateProjectionMatrix();
	});

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
</script>

<div
	bind:clientWidth={canvasSize.width}
	class="relative"
>
	<div
		class="absolute top-2 right-2 not-content"
		{@attach pane}
	></div>
	<canvas
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				canvas,
			});

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
			});

			renderer.setAnimationLoop(() => {
				mesh.rotateY(rotationAmount);
				renderer.render(scene, camera);
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
