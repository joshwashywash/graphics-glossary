<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";

	import {
		State,
		createRendererAttachment,
	} from "@attachments/createRendererAttachment.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { Color, Pane, Slider } from "svelte-tweakpane-ui";
	import { Mesh, PerspectiveCamera, Scene, TorusKnotGeometry } from "three";

	const s = new State();

	let baseColor = $state("#000000");
	let fresnelColor = $state("#ffffff");
	let power = $state(1);

	s.withRenderer = (renderer) => {};

	const geometry = new TorusKnotGeometry();

	const uniforms = createUniforms();
	const material = new FresnelMaterial(uniforms);

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			material.dispose();
			geometry.dispose();
		};
	});

	const camera = new PerspectiveCamera();
	camera.translateZ(5);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(s.aspect);
	});

	const rotationAmount = (1 / 100) * Math.PI;

	$effect(() => {
		uniforms.uBaseColor.value.set(baseColor);
	});

	$effect(() => {
		uniforms.uFresnelColor.value.set(fresnelColor);
	});

	$effect(() => {
		uniforms.uPower.value = power;
	});

	s.withRenderer = (renderer) => {
		renderer.setAnimationLoop(() => {
			mesh.rotateY(rotationAmount);
			renderer.render(scene, camera);
		});
		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div
	bind:clientWidth={s.canvasWidth}
	class="sm:relative"
>
	<canvas {@attach createRendererAttachment(s)}></canvas>
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
