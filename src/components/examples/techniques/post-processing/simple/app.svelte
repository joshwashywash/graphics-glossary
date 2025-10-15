<script
	lang="ts"
	module
>
	const axis = new Vector3(-1, 1, -1).normalize();
	const gltfLoader = new GLTFLoader();
	const hdrLoader = new HDRLoader();
</script>

<script lang="ts">
	import fragmentShader from "./fragments/mix.glsl?raw";
	import vertexShader from "./vertex.glsl?raw";

	import { Label, Pane } from "@components/controls";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		Color,
		EquirectangularReflectionMapping,
		PerspectiveCamera,
		Scene,
		ShaderMaterial,
		Uniform,
		Vector3,
		WebGLRenderTarget,
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
	import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
	import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";

	let { alpha = 0.3, color1 = "#272838", color2 = "#f3de8a" } = $props();

	const gltf = gltfLoader.loadAsync(`/models/vehicle-truck.glb`);
	const hdr = hdrLoader
		.loadAsync("/hdrs/university_workshop_1k.hdr")
		.then((hdr) => {
			hdr.mapping = EquirectangularReflectionMapping;
			return hdr;
		});

	let clientWidth = $state(1);
	let clientHeight = $state(1);
	const aspect = $derived(clientWidth / clientHeight);

	const scene = new Scene();

	const camera = new PerspectiveCamera().translateOnAxis(axis, 2);
	camera.lookAt(scene.position);

	const controls = new OrbitControls(camera);

	const renderTarget = new WebGLRenderTarget(1, 1);

	const uAlpha = new Uniform(0);
	const uColor1 = new Uniform(new Color());
	const uColor2 = new Uniform(new Color());
	const uScene = new Uniform(renderTarget.texture);
	const uTimeMs = new Uniform(0);

	const material = new ShaderMaterial({
		fragmentShader,
		uniforms: {
			uAlpha,
			uColor1,
			uColor2,
			uScene,
			uTimeMs,
		},
		vertexShader,
	});

	const quad = new FullScreenQuad(material);

	onCleanup(() => {
		material.dispose();
		quad.dispose();
		renderTarget.dispose();
	});
</script>

<div class="relative">
	<Pane class="absolute top-2 right-2">
		<details open>
			<summary>uniforms</summary>
			<Label>
				color 1
				<input
					type="color"
					bind:value={color1}
				/>
			</Label>
			<Label>
				color 2
				<input
					type="color"
					bind:value={color2}
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
				quad.render(renderer);
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
				camera.updateProjectionMatrix();
				render();
			});

			$effect(() => {
				uAlpha.value = alpha;
				render();
			});

			$effect(() => {
				uColor1.value.set(color1);
				render();
			});

			$effect(() => {
				uColor2.value.set(color2);
				render();
			});

			gltf.then((gltf) => {
				scene.add(gltf.scene);
				render();
			});

			hdr.then((hdr) => {
				scene.background = hdr;
				scene.environment = hdr;
				render();
			});

			controls.addEventListener("change", render);
			controls.connect(renderer.domElement);

			renderer.setAnimationLoop((time) => {
				uTimeMs.value = time;
				render();
			});

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
