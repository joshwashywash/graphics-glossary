<script
	lang="ts"
	module
>
	const axis = new Vector3(0, 0, 1);
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
	)
		.mul(1 / 16.0)
		.setName("bayer4x4");

	const bayerIndex = uv().mul(screenSize).floor().mod(4).setName("bayerIndex");

	const bayerValue = bayer4x4Matrix
		.element(bayerIndex.y)
		.element(bayerIndex.x)
		.setName("bayerValue");

	const angle = 1 * DEG2RAD;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
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
		WebGPURenderer,
	} from "three/webgpu";

	const geometry = new TorusKnotGeometry();
	const material = new MeshStandardMaterial();
	const mesh = new Mesh(geometry, material);
	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera().translateOnAxis(axis, 5);
	camera.lookAt(mesh.position);

	hdrLoader.loadAsync("/hdrs/university_workshop_1k.hdr").then((hdr) => {
		hdr.mapping = EquirectangularReflectionMapping;
		scene.background = hdr;
		scene.environment = hdr;
	});

	useCleanup(() => {
		geometry.dispose();
		material.dispose();
	});

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
			renderer.setPixelRatio(devicePixelRatio.current);
		});

		const postProcessing = new PostProcessing(renderer);
		postProcessing.outputNode = vec4(
			dot(vec3(0.2126, 0.7152, 0.0722), pass(scene, camera).rgb)
				.lessThan(bayerValue)
				.toVec3(),
			1.0,
		);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.autoRotate = true;

		renderer.setAnimationLoop(() => {
			mesh.rotateX(angle);
			controls.update();
			postProcessing.render();
		});

		$effect(() => {
			renderer.setSize(canvasSize.width, canvasSize.height, false);
			updateCameraAspect(camera, canvasSize.ratio);
		});

		return () => {
			controls.dispose();
			renderer.setAnimationLoop(null);
			renderer.dispose();
			postProcessing.dispose();
		};
	}}
>
</canvas>
