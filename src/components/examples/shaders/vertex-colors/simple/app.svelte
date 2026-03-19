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
	import createPaneAttachment from "@attachments/createPane";

	import { Size } from "@classes/size.svelte";

	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createRenderer } from "@functions/createRenderer.svelte";
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

	const material = useDisposable(MeshBasicMaterial, {
		vertexColors: true,
	});

	const mesh = new Mesh(geometry, material);

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);

	const canvasSize = new Size();

	$effect(() => {
		updateCameraAspect(camera, canvasSize.ratio);
	});

	const pane = createPaneAttachment({
		initialize: (pane) => {
			pane.addBinding(
				{
					get useVertexColors() {
						return material.vertexColors;
					},
					set useVertexColors(value) {
						material.vertexColors = value;
						material.needsUpdate = true;
					},
				},
				"useVertexColors",
				{
					label: "use vertex colors",
				},
			);
		},
	});
</script>

<div class="relative">
	<PaneContainer
		class="absolute top-2 right-2"
		{@attach pane}
	/>

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = createRenderer(
				{
					antialias: true,
					canvas,
				},
				() => canvasSize.width,
				() => canvasSize.height,
			);

			const controls = useDisposable(
				OrbitControls,
				camera,
				renderer.domElement,
			);
			controls.autoRotate = true;

			renderer.setAnimationLoop(() => {
				controls.update();
				renderer.render(mesh, camera);
			});
		}}
	>
	</canvas>
</div>
