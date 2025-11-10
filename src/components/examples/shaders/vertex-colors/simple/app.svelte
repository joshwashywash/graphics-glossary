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

	import { onCleanup } from "@functions/onCleanup.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";

	import {
		BoxGeometry,
		Matrix4,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		Vector3,
		WebGLRenderer,
	} from "three";
	import { DEG2RAD } from "three/src/math/MathUtils.js";

	let rotateMesh = $state(true);

	const geometry = new BoxGeometry();
	const positionAttribute = geometry.getAttribute("position");

	const colorAttribute = positionAttribute.clone().applyMatrix4(matrix);
	geometry.setAttribute("color", colorAttribute);

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

<Example>
	{#snippet pane()}
		<details open>
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
		}}
	>
	</canvas>
</Example>
