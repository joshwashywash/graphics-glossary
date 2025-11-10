<script
	lang="ts"
	module
>
	const degrees = 1;
	const angle = DEG2RAD * degrees;
</script>

<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";

	import { Size } from "@classes/size.svelte";

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

	const canvasSize = new Size();

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

			const renderIfNotLooping = () => {
				if (animationLoop === null) render();
			};

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);

				const aspect = canvasSize.width / canvasSize.height;
				updateCameraAspect(camera, aspect);

				renderIfNotLooping();
			});

			$effect(() => {
				uniforms.uBaseColor.value.setStyle(baseColor);
				renderIfNotLooping();
			});

			$effect(() => {
				uniforms.uFresnelColor.value.setStyle(fresnelColor);
				renderIfNotLooping();
			});

			$effect(() => {
				uniforms.uPower.value = power;
				renderIfNotLooping();
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
