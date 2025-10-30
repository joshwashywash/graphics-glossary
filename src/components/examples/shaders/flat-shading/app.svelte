<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";

	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
		WebGLRenderer,
	} from "three";
	import { DEG2RAD } from "three/src/math/MathUtils.js";

	let degrees = $state(1);
	const radians = $derived(DEG2RAD * degrees);
	const radiansIsPositive = $derived(radians > 0);

	const distance = 5;
	const halfDistance = 0.5 * distance;

	const geometry = new TorusKnotGeometry();

	const material = new MeshNormalMaterial();
	const flatShadingMaterial = material.clone();
	flatShadingMaterial.flatShading = true;

	onCleanup(() => {
		material.dispose();
		flatShadingMaterial.dispose();
		geometry.dispose();
	});

	const mesh = new Mesh(geometry, material);
	mesh.translateX(-1 * halfDistance);

	const flatShadingMesh = new Mesh(geometry, flatShadingMaterial);
	flatShadingMesh.translateX(halfDistance);

	const meshes = [mesh, flatShadingMesh];

	const scene = new Scene().add(...meshes);

	const camera = new PerspectiveCamera();
	camera.translateZ(10);

	const canvasSize = new Size();

	let animationLoop: null | (() => void) = null;
</script>

<Example>
	{#snippet pane()}
		<details open>
			<summary>flat shading scene controls</summary>
			<Label>
				mesh rotation speed
				<input
					type="range"
					bind:value={degrees}
					min={0}
					max={5}
					step={1}
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

			const renderIfNotAnimating = () => {
				if (animationLoop === null) render();
			};

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);
				renderIfNotAnimating();
			});

			$effect(() => {
				updateCameraAspect(camera, canvasSize.aspect);
				renderIfNotAnimating();
			});

			$effect(() => {
				if (!radiansIsPositive) return;

				renderer.setAnimationLoop(
					(animationLoop = () => {
						for (const mesh of meshes) {
							mesh.rotateY(radians);
						}
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
