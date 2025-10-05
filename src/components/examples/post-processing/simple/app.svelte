<script
	lang="ts"
	module
>
	const axis = new Vector3(-1, 1, -1).normalize();
	const gltfLoader = new GLTFLoader();
	const hdrLoader = new HDRLoader();
</script>

<script lang="ts">
	import { ScreenQuadGeometry } from "./ScreenQuadGeometry";
	import fragmentShader from "./fragment.glsl?raw";
	import { createAttachment } from "./pane";
	import vertexShader from "./vertex.glsl?raw";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import { untrack } from "svelte";
	import {
		AmbientLight,
		Color,
		EquirectangularReflectionMapping,
		Mesh,
		OrthographicCamera,
		PerspectiveCamera,
		RawShaderMaterial,
		Scene,
		Uniform,
		Vector3,
		WebGLRenderTarget,
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
	import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

	let clientWidth = $state(1);
	let clientHeight = $state(1);
	const aspect = $derived(clientWidth / clientHeight);

	const light = new AmbientLight();
	const scene = new Scene().add(light);

	const gltf = gltfLoader.loadAsync("/models/vehicle-truck.glb");
	const hdr = hdrLoader.loadAsync("/hdrs/university_workshop_1k.hdr");

	const promises = Promise.all([gltf, hdr]);

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(axis, 3);
	camera.lookAt(scene.position);

	const controls = new OrbitControls(camera);

	const renderTarget = new WebGLRenderTarget();

	const uScene = new Uniform(renderTarget.texture);
	const uColor = new Uniform(new Color().setHSL(0.6, 1, 0.5));
	const uAlpha = new Uniform(0.2);
	const uniforms = {
		uAlpha,
		uColor,
		uScene,
	};

	const geometry = new ScreenQuadGeometry();
	const material = new RawShaderMaterial({
		fragmentShader,
		uniforms,
		vertexShader,
	});

	onCleanup(() => {
		geometry.dispose();
		material.dispose();
		renderTarget.dispose();
	});

	const mesh = new Mesh(geometry, material);
	mesh.frustumCulled = false;

	const ppScene = new Scene().add(mesh);
	const ppCamera = new OrthographicCamera();

	let alpha = $state(0.3);
	let color = $state("#ffccaa");

	const params = {
		get alpha() {
			return untrack(() => alpha);
		},
		set alpha(value) {
			alpha = value;
		},
		get color() {
			return untrack(() => color);
		},
		set color(value) {
			color = value;
		},
	};

	const pane = createAttachment(params);
</script>

<div class="relative">
	<div
		class="absolute top-2 right-2 not-content"
		{@attach pane}
	></div>
	<canvas
		class="w-full aspect-square"
		bind:clientWidth
		bind:clientHeight
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
			});

			const render = () => {
				const last = renderer.getRenderTarget();
				renderer.setRenderTarget(renderTarget);
				renderer.render(scene, camera);
				renderer.setRenderTarget(last);
				renderer.render(ppScene, ppCamera);
			};

			$effect(() => {
				renderTarget.setSize(clientWidth, clientHeight);
				render();
			});

			$effect(() => {
				renderer.setSize(clientWidth, clientHeight, false);
				render();
			});

			$effect(() => {
				camera.aspect = aspect;
				render();
			});

			$effect(() => {
				uAlpha.value = alpha;
				render();
			});

			$effect(() => {
				uColor.value.setStyle(color);
				render();
			});

			promises.then(([gltf, hdr]) => {
				scene.add(gltf.scene);

				hdr.mapping = EquirectangularReflectionMapping;
				scene.background = hdr;
				scene.environment = hdr;

				render();
			});

			controls.addEventListener("change", render);
			controls.connect(renderer.domElement);

			return () => {
				controls.removeEventListener("change", render);
				controls.disconnect();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
