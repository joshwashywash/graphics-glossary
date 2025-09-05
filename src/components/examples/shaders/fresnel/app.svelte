<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";

	import { createRendererAttachment } from "@attachments/createRendererAttachment.svelte";

	import { Size } from "@classes/Size.svelte";

	import { Color, Pane, Slider } from "svelte-tweakpane-ui";
	import { Mesh, PerspectiveCamera, Scene, TorusKnotGeometry } from "three";

	let baseColor = $state("#000000");
	let fresnelColor = $state("#ffffff");
	let power = $state(1);

	const uniforms = createUniforms();

	$effect(() => {
		uniforms.uBaseColor.value.set(baseColor);
	});

	$effect(() => {
		uniforms.uFresnelColor.value.set(fresnelColor);
	});

	$effect(() => {
		uniforms.uPower.value = power;
	});

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

	const fresnelAttachment = createRendererAttachment({
		getRendererParameters: () => ({ antialias: true }),
		getWithRenderer: () => (renderer) => {
			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
			});

			renderer.setAnimationLoop(() => {
				mesh.rotateY(rotationAmount);
				renderer.render(scene, camera);
			});

			return () => {
				renderer.setAnimationLoop(null);
			};
		},
	});
</script>

<div
	bind:clientWidth={canvasSize.width}
	class="sm:relative"
>
	<canvas {@attach fresnelAttachment}></canvas>
	<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
		<Pane position="inline">
			<Color
				bind:value={baseColor}
				label="base color"
			/>
			<Color
				bind:value={fresnelColor}
				label="fresnel color"
			/>
			<Slider
				bind:value={power}
				label="power"
				min={0}
				max={5}
				step={0.1}
			/>
		</Pane>
	</div>
</div>
