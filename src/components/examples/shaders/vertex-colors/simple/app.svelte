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
	import { createRendererAttachment } from "@attachments/createRendererAttachment.svelte";

	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { DEG2RAD } from "three/src/math/MathUtils.js";
	import {
		BoxGeometry,
		Matrix4,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Vector3,
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

	const camera = new PerspectiveCamera().translateZ(3);

	const canvasSize = new Size();

	let animationLoop: null | (() => void) = null;

	const attachment = createRendererAttachment((renderer) => {
		const render = () => {
			renderer.render(mesh, camera);
		};

		const renderIfNotAnimating = () => {
			if (animationLoop === null) render();
		};

		$effect(() => {
			renderer.setSize(canvasSize.width, canvasSize.height, false);
			updateCameraAspect(camera, canvasSize.ratio);

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
	});
</script>

<div class="relative">
	<details class="example-pane">
		<summary>controls</summary>
		<Label>
			rotate mesh
			<input
				type="checkbox"
				bind:checked={rotateMesh}
			/>
		</Label>
	</details>

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach attachment}
	>
	</canvas>
</div>
