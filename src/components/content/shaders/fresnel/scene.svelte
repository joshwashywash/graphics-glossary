<script lang="ts">
	import fragmentShader from "./fragment.glsl?raw";
	import vertexShader from "./vertex.glsl?raw";

	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import { getAdd } from "@contexts/add";
	import { getSize } from "@contexts/size";
	import { getWithRenderer } from "@contexts/withRenderer";
	import { Color, Mesh, ShaderMaterial, TorusGeometry, Uniform } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let {
		autoRotate = true,
		baseColor = "#000000",
		fresnelColor = "#ffffff",
		power = 1,
	}: {
		autoRotate?: boolean;
		baseColor?: string;
		fresnelColor?: string;
		power?: number;
	} = $props();

	const geometry = new TorusGeometry();

	const uBaseColor = new Uniform(new Color());
	const uFresnelColor = new Uniform(new Color());
	const uPower = new Uniform(1);

	$effect(() => {
		uBaseColor.value.set(baseColor);
	});

	$effect(() => {
		uFresnelColor.value.set(fresnelColor);
	});

	$effect(() => {
		uPower.value = power;
	});

	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
		uniforms: {
			uBaseColor,
			uFresnelColor,
			uPower,
		},
	});

	$effect(() => {
		return () => {
			geometry.dispose();
			material.dispose();
		};
	});

	const mesh = new Mesh(geometry, material);

	const add = getAdd();

	const scene = add(mesh);

	const size = getSize();

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 5);

	const controls = new OrbitControls(camera);

	$effect(() => {
		controls.autoRotate = autoRotate;
	});

	const withRenderer = getWithRenderer();

	withRenderer((renderer) => {
		controls.connect(renderer.domElement);

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
			controls.dispose();
		};
	});
</script>
