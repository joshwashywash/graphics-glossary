<script
	lang="ts"
	module
>
	const CAMERA_TRANSLATION_AXIS = new Vector3(0, 0, 1);
	const CAMERA_TRANSLATION_AMOUNT = 5;

	const hdrLoader = new HDRLoader();

	const bayer4x4Matrix = mat4(
		0.0,
		8.0,
		2.0,
		10.0,
		12.0,
		4.0,
		14.0,
		6.0,
		3.0,
		11.0,
		1.0,
		9.0,
		15.0,
		7.0,
		13.0,
		5.0,
	).mul(1 / 16.0);

	const bayerIndex = uv().mul(screenSize).floor().mod(4);

	const bayerValue = bayer4x4Matrix.element(bayerIndex.y).element(bayerIndex.x);

	const angle = 1 * DEG2RAD;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resizeRenderer } from "@functions/resizeRenderer";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
	import { DEG2RAD } from "three/src/math/MathUtils.js";
	import { dot, mat4, pass, screenSize, uv, vec3, vec4 } from "three/tsl";
	import {
		EquirectangularReflectionMapping,
		Mesh,
		MeshStandardMaterial,
		PerspectiveCamera,
		PostProcessing,
		Scene,
		TorusKnotGeometry,
		Vector3,
	} from "three/webgpu";

	const geometry = useDisposable(TorusKnotGeometry);
	const material = useDisposable(MeshStandardMaterial);
	const mesh = new Mesh(geometry, material);
	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera().translateOnAxis(
		CAMERA_TRANSLATION_AXIS,
		CAMERA_TRANSLATION_AMOUNT,
	);
	camera.lookAt(mesh.position);

	const hdr = await hdrLoader.loadAsync("/hdrs/university_workshop_1k.hdr");
	hdr.mapping = EquirectangularReflectionMapping;
	scene.background = hdr;
	scene.environment = hdr;

	const canvasSize = new Size();

	$effect(() => {
		updateCameraAspect(camera, canvasSize.width / canvasSize.height);
	});
</script>

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

		const postProcessing = useDisposable(PostProcessing, renderer);
		postProcessing.outputNode = vec4(
			dot(vec3(0.2126, 0.7152, 0.0722), pass(scene, camera).rgb)
				.lessThan(bayerValue)
				.toVec3(),
			1.0,
		);

		const controls = useDisposable(OrbitControls, camera, renderer.domElement);
		controls.autoRotate = true;

		renderer.setAnimationLoop(() => {
			mesh.rotateX(angle);
			controls.update();
			postProcessing.render();
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	}}
>
</canvas>
