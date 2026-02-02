<script
	module
	lang="ts"
>
	const colorAttributeTransformMatrix = new Matrix4().makeTranslation(
		new Vector3().setScalar(0.5),
	);

	const cameraTranslationAxis = new Vector3(1, 1, 1).normalize();
	const cameraTranslationAmount = 3;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resizeRenderer } from "@functions/resizeRenderer";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import {
		BoxGeometry,
		Matrix4,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Vector3,
	} from "three/webgpu";

	const geometry = useDisposable(BoxGeometry);
	geometry.setAttribute(
		"color",
		geometry
			.getAttribute("position")
			.clone()
			.applyMatrix4(colorAttributeTransformMatrix),
	);

	const material = useDisposable(MeshBasicMaterial);

	const mesh = new Mesh(geometry, material);

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);

	const canvasSize = new Size();

	$effect(() => {
		updateCameraAspect(camera, canvasSize.width / canvasSize.height);
	});

	let useVertexColors = $state((material.vertexColors = true));
	const getUseVertexColors = () => useVertexColors;
	const setUseVertexColors = (value: boolean) => {
		useVertexColors = material.vertexColors = value;
		material.needsUpdate = true;
	};
</script>

<div class="relative">
	<details class="example-pane">
		<summary>vertex colors</summary>
		<Label>
			enabled
			<input
				type="checkbox"
				bind:checked={getUseVertexColors, setUseVertexColors}
			/>
		</Label>
	</details>

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = createRenderer({
				antialias: true,
				canvas,
			});

			$effect(() => {
				resizeRenderer(renderer, canvasSize.width, canvasSize.height);
			});

			const controls = new OrbitControls(camera, renderer.domElement);
			controls.autoRotate = true;

			renderer.setAnimationLoop(() => {
				controls.update();
				renderer.render(mesh, camera);
			});

			return () => {
				controls.dispose();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
