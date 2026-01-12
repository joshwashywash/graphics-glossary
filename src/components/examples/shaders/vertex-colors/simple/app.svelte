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

	import { setPixelRatio } from "@functions/setPixelRatio.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import {
		BoxGeometry,
		Matrix4,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Vector3,
		WebGPURenderer,
	} from "three/webgpu";

	const geometry = new BoxGeometry();
	geometry.setAttribute(
		"color",
		geometry
			.getAttribute("position")
			.clone()
			.applyMatrix4(colorAttributeTransformMatrix),
	);

	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	useCleanup(() => {
		geometry.dispose();
		material.dispose();
	});

	const mesh = new Mesh(geometry, material);

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);

	const canvasSize = new Size();
</script>

<canvas
	class="example-canvas"
	bind:clientWidth={canvasSize.width}
	bind:clientHeight={canvasSize.height}
	{@attach (canvas) => {
		const renderer = new WebGPURenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setSize(canvasSize.width, canvasSize.height, false);
			updateCameraAspect(camera, canvasSize.ratio);
		});

		setPixelRatio(() => renderer);

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
