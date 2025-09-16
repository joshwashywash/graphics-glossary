<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";

	import { Size } from "@classes/Size.svelte";

	import { Color, Pane, Slider } from "svelte-tweakpane-ui";
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
			scene.remove(mesh);
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
</script>

<div
	bind:clientWidth={canvasSize.width}
	class="relative"
>
	<canvas
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
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

	<div class="absolute bottom-4 right-4 not-content">
		<Pane
			position="inline"
			title="uniforms"
		>
			<Color
				bind:value={
					() => `#${uniforms.uBaseColor.value.getHexString()}`,
					(value) => uniforms.uBaseColor.value.setStyle(value)
				}
				label="base color"
			/>
			<Color
				bind:value={
					() => `#${uniforms.uFresnelColor.value.getHexString()}`,
					(value) => uniforms.uFresnelColor.value.setStyle(value)
				}
				label="fresnel color"
			/>
			<Slider
				bind:value={uniforms.uPower.value}
				label="power"
				min={0.5}
				max={3}
				step={0.1}
			/>
		</Pane>
	</div>
</div>
