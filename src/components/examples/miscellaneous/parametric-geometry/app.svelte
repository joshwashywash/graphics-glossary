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
	import { pringle } from "@functions/parametric/pringle";
	import { createSphube } from "@functions/parametric/sphube";
	import { resize } from "@functions/resize";
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
		WebGPURenderer,
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

	const controls = createDisposed(OrbitControls, camera);
	controls.autoRotate = true;
</script>

<canvas
	class="aspect-square"
	{@attach (canvas) => {
		const renderer = new WebGPURenderer({
			antialias: true,
			canvas,
		});

		controls.connect(renderer.domElement);

		const promise = renderer.setAnimationLoop(() => {
			const canvas = renderer.domElement;
			if (resize(renderer)) {
				const aspect = canvas.clientWidth / canvas.clientHeight;
				setCameraAspect(camera, aspect);
			}

			controls.update();
			renderer.render(group, camera);
		});

		return () => {
			controls.disconnect();
			promise
				.then(() => {
					return renderer.setAnimationLoop(null);
				})
				.then(() => {
					renderer.dispose();
				});
		};
	}}
>
</canvas>
