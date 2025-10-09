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
	import vertexShader from "./vertex.glsl?raw";

	import { Label, Pane } from "@components/controls";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
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

	let { alpha = 0.3, color = "#ffccaa" } = $props();

	const gltf = gltfLoader.loadAsync(`/models/vehicle-truck.glb`);
	const hdr = hdrLoader
		.loadAsync("/hdrs/university_workshop_1k.hdr")
		.then((hdr) => {
			hdr.mapping = EquirectangularReflectionMapping;
			return hdr;
		});

	const promises = Promise.all([gltf, hdr]);

	let clientWidth = $state(1);
	let clientHeight = $state(1);
	const aspect = $derived(clientWidth / clientHeight);

	const scene = new Scene();

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(axis, 3);
	camera.lookAt(scene.position);

	const controls = new OrbitControls(camera);

	const renderTarget = new WebGLRenderTarget();

	const uAlpha = new Uniform(0);
	const uColor = new Uniform(new Color());
	const uScene = new Uniform(renderTarget.texture);

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
</script>

<div class="relative">
	<Pane class="absolute top-2 right-2">
		<details open>
			<summary>uniforms</summary>
			<Label>
				color
				<input
					type="color"
					bind:value={color}
				/>
			</Label>
			<Label>
				alpha
				<input
					type="range"
					bind:value={alpha}
					min={0}
					max={1}
					step={0.1}
				/>
			</Label>
		</details>
	</Pane>

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

				scene.background = hdr;
				scene.environment = hdr;

				render();
			});

			controls.addEventListener("change", render);
			controls.connect(renderer.domElement);

			return () => {
				controls.removeEventListener("change", render);
				controls.disconnect();
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
