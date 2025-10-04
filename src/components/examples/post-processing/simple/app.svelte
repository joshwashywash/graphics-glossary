<script
	lang="ts"
	module
>
	const axis = new Vector3(-1, 1, -1).normalize();
	const loader = new GLTFLoader();

	const speed = 0.25 * 0.01;
</script>

<script lang="ts">
	import { ScreenQuadGeometry } from "./ScreenQuadGeometry";
	import fragmentShader from "./fragment.glsl?raw";
	import vertexShader from "./vertex.glsl?raw";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		AmbientLight,
		Color,
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
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

	let clientWidth = $state(1);
	let clientHeight = $state(1);
	const aspect = $derived(clientWidth / clientHeight);

	const light = new AmbientLight();
	const scene = new Scene().add(light);

	loader.load("/models/vehicle-truck.glb", (gltf) => {
		scene.add(gltf.scene);
	});

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(axis, 5);
	camera.lookAt(scene.position);

	const renderTarget = new WebGLRenderTarget();

	const uScene = new Uniform(renderTarget.texture);
	const uColor = new Uniform(new Color().setHSL(0, 1, 0.5));
	const uniforms = {
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

		renderer.setAnimationLoop((time) => {
			time = 0.5 * (1 + Math.sin(time));
			uColor.value.offsetHSL(speed * time, 0, 0);
			render();
		});

		return () => {
			renderer.setAnimationLoop(null);
			renderer.dispose();
		};
	}}
>
</canvas>
