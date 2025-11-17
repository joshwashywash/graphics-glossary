<script
	lang="ts"
	module
>
	const degrees = 1;
	const angle = DEG2RAD * degrees;
</script>

<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";

	import {
		Mesh,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
		WebGLRenderer,
	} from "three";
	import { DEG2RAD } from "three/src/math/MathUtils.js";

	let rotateMesh = $state(true);

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

	let canvasWidth = $state(1);
	let canvasHeight = $state(1);
	const canvasAspect = $derived(canvasWidth / canvasHeight);

	let animationLoop: null | (() => void) = null;
</script>

<Example>
	{#snippet pane()}
		<details open>
			<summary>controls</summary>
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
			<Label>
				rotate mesh
				<input
					type="checkbox"
					bind:checked={rotateMesh}
				/>
			</Label>
		</details>
	{/snippet}

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasWidth}
		bind:clientHeight={canvasHeight}
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			const renderIfNotAnimating = () => {
				if (animationLoop === null) render();
			};

			$effect(() => {
				renderer.setSize(canvasWidth, canvasHeight, false);

				updateCameraAspect(camera, canvasAspect);

				renderIfNotAnimating();
			});

			$effect(() => {
				uniforms.uBaseColor.value.setStyle(baseColor);
				renderIfNotAnimating();
			});

			$effect(() => {
				uniforms.uFresnelColor.value.setStyle(fresnelColor);
				renderIfNotAnimating();
			});

			$effect(() => {
				uniforms.uPower.value = power;
				renderIfNotAnimating();
			});

			$effect(() => {
				if (!rotateMesh) return;

				renderer.setAnimationLoop(
					(animationLoop = () => {
						mesh.rotateY(angle);
						render();
					}),
				);
				return () => {
					renderer.setAnimationLoop((animationLoop = null));
				};
			});

			return () => {
				renderer.dispose();
			};
		}}
	>
	</canvas>
</Example>
