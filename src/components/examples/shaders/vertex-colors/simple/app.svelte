<script
	module
	lang="ts"
>
	const axis = new Vector3(1, 1, -1).normalize();

	const matrix = new Matrix4().makeTranslation(new Vector3().setScalar(0.5));
	const degrees = 1;

	const angle = DEG2RAD * degrees;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import resize from "@functions/resize";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { DEG2RAD } from "three/src/math/MathUtils.js";
	import {
		BoxGeometry,
		Matrix4,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		Vector3,
		WebGPURenderer,
	} from "three/webgpu";

	let rotateMesh = $state(true);

	const geometry = new BoxGeometry();
	const positionAttribute = geometry.getAttribute("position");

	const colorAttribute = positionAttribute.clone().applyMatrix4(matrix);
	geometry.setAttribute("color", colorAttribute);

	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	useCleanup(() => {
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

<Example>
	{#snippet pane()}
		<details>
			<summary>controls</summary>
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
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = new WebGPURenderer({
				antialias: true,
				canvas,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			const renderIfNotAnimating = () => {
				if (animationLoop === null) render();
			};

			const promise = renderer.init().then((renderer) => {
				return $effect.root(() => {
					$effect(() => {
						resize(renderer, camera, canvasSize);
						renderIfNotAnimating();
					});

					$effect(() => {
						if (!rotateMesh) return;

						renderer.setAnimationLoop(
							(animationLoop = () => {
								mesh.rotateOnAxis(axis, angle);
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
				});
			});

			return () => {
				promise.then((cleanup) => cleanup());
			};
		}}
	>
	</canvas>
</Example>
