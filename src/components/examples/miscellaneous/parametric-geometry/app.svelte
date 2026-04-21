<script
	lang="ts"
	module
>
	const cameraTranslationAxis = new Vector3(1, 1, 1).normalize();
	const cameraTranslationAmount = 5;

	const detail = 1 << 8;
</script>

<script lang="ts">
	import { createDisposed } from "@functions/createDisposed.svelte";
	import { createRenderer } from "@functions/createRenderer.svelte";
	import { pringle } from "@functions/parametric/pringle";
	import { createSphube } from "@functions/parametric/sphube";
	import { resize } from "@functions/resize.svelte";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
	import {
		DoubleSide,
		Group,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Vector3,
	} from "three/webgpu";

	const material = createDisposed(MeshNormalMaterial, {
		side: DoubleSide,
	});

	const sphubeGeometry = createDisposed(
		ParametricGeometry,
		createSphube(),
		detail,
		detail,
	);
	const pringleGeometry = createDisposed(
		ParametricGeometry,
		pringle,
		detail,
		detail,
	);

	const sphubeMesh = new Mesh(sphubeGeometry, material).translateX(-1);
	const pringleMesh = new Mesh(pringleGeometry, material).translateX(1);

	const group = new Group().add(pringleMesh, sphubeMesh);

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);
	camera.lookAt(group.position);
</script>

<canvas
	class="aspect-video"
	{@attach (canvas) => {
		const renderer = createRenderer({
			antialias: true,
			canvas,
		});

		const controls = createDisposed(OrbitControls, camera, renderer.domElement);
		controls.autoRotate = true;

		renderer.setAnimationLoop(() => {
			const canvas = renderer.domElement;
			if (resize(renderer)) {
				const aspect = canvas.clientWidth / canvas.clientHeight;
				setCameraAspect(camera, aspect);
			}

			controls.update();
			renderer.render(group, camera);
		});
	}}
>
</canvas>
