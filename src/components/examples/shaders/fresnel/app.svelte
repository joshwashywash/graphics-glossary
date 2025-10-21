<script
	lang="ts"
	module
>
	const rotationAmount = (1 / 180) * Math.PI;
</script>

<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";

	import { Size } from "@classes/size.svelte";

	import { Label, Pane } from "@components/controls";

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

	let baseColor = $state("#583583");
	let fresnelColor = $state("#ccccaa");
	let power = $state(1.5);

	const canvasSize = new Size();
</script>

<div class="relative">
	<Pane class="absolute top-2 right-2">
		<details open>
			<summary>uniforms</summary>
			<Label>
				base color
				<input
					type="color"
					bind:value={baseColor}
				/>
			</Label>
			<Label>
				fresnel color
				<input
					type="color"
					bind:value={fresnelColor}
				/>
			</Label>
			<Label>
				power
				<input
					type="range"
					bind:value={power}
					min={0}
					max={3}
					step={0.5}
				/>
			</Label>
		</details>
	</Pane>

	<canvas
		class="w-full aspect-square"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);
			});

			$effect(() => {
				camera.aspect = canvasSize.aspect;
				camera.updateProjectionMatrix();
			});

			$effect(() => {
				uniforms.uBaseColor.value.setStyle(baseColor);
			});

			$effect(() => {
				uniforms.uFresnelColor.value.setStyle(fresnelColor);
			});

			$effect(() => {
				uniforms.uPower.value = power;
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
