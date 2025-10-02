<script lang="ts">
	import { ScreenQuadGeometry } from "./ScreenQuadGeometry";
	import fragmentShader from "./fragment.glsl?raw";
	import vertexShader from "./vertex.glsl?raw";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		Color,
		Mesh,
		PerspectiveCamera,
		RawShaderMaterial,
		Scene,
		Uniform,
		WebGLRenderer,
	} from "three";

	let clientWidth = $state(1);
	let clientHeight = $state(1);
	const aspect = $derived(clientWidth / clientHeight);

	const camera = new PerspectiveCamera();

	const uColor = new Uniform(new Color().setHSL(1, 1, 0.5));
	const uniforms = {
		uColor,
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
	});

	const mesh = new Mesh(geometry, material);
	mesh.frustumCulled = false;

	const scene = new Scene().add(mesh);

	const speed = 0.25 * 0.01;
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
			renderer.render(scene, camera);
		};

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
