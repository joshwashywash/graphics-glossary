<script
	lang="ts"
	module
>
	const cameraTranslationAxis = new Vector3(1, 1, 1).normalize();
	const cameraTranslationAmount = 5;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { pringle } from "@functions/parametric/functions/pringle";
	import { createSphube } from "@functions/parametric/functions/sphube";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
	import {
		DoubleSide,
		Group,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Vector3,
		WebGPURenderer,
	} from "three/webgpu";

	const material = new MeshNormalMaterial({
		side: DoubleSide,
	});

	const detail = 1 << 8;

	const sphubeGeometry = new ParametricGeometry(createSphube(), detail, detail);
	const pringleGeometry = new ParametricGeometry(pringle, detail, detail);

	useCleanup(() => {
		sphubeGeometry.dispose();
		pringleGeometry.dispose();
		material.dispose();
	});

	const sphubeMesh = new Mesh(sphubeGeometry, material).translateX(-1);
	const pringleMesh = new Mesh(pringleGeometry, material).translateX(1);

	const group = new Group().add(pringleMesh, sphubeMesh);

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);
	camera.lookAt(group.position);

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

		$effect(() => {
			renderer.setPixelRatio(devicePixelRatio.current);
		});

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.autoRotate = true;

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(group, camera);
		});

		return () => {
			controls.dispose();
			renderer.setAnimationLoop(null);
			renderer.dispose();
		};
	}}
>
</canvas>
