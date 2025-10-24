<script
	module
	lang="ts"
>
	const axis = new Vector3(1, 1, -1).normalize();
</script>

<script lang="ts">
	import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";

	import { Size } from "@classes/size.svelte";

	import { Label, Pane } from "@components/controls";

	import { onCleanup } from "@functions/onCleanup.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";

	import {
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		Vector3,
		WebGLRenderer,
	} from "three";
	import { DEG2RAD } from "three/src/math/MathUtils.js";

	let degrees = $state(1);
	const radians = $derived(DEG2RAD * degrees);
	const radiansIsPositive = $derived(radians > 0);

	const geometry = new VertexColorsBoxGeometry();
	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	onCleanup(() => {
		geometry.dispose();
		material.dispose();
	});

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera();
	camera.translateZ(3);

	const canvasSize = new Size();

	let animationLoop: null | (() => void) = null;
</script>

<div class="relative">
	<Pane class="absolute top-2 right-2">
		<details open>
			<summary>scene</summary>
			<Label>
				rotation speed
				<input
					type="range"
					bind:value={degrees}
					min={0}
					max={5}
					step={1}
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

			const renderIfNotLooping = () => {
				if (animationLoop === null) render();
			};

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);
				renderIfNotLooping();
			});

			$effect(() => {
				updateCameraAspect(camera, canvasSize.aspect);
				renderIfNotLooping();
			});

			$effect(() => {
				if (!radiansIsPositive) return;

				renderer.setAnimationLoop(
					(animationLoop = () => {
						mesh.rotateOnAxis(axis, radians);
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
</div>
