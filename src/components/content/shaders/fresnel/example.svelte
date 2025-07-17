<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";

	import { renderer } from "@attachments/renderer.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import { Mesh, PerspectiveCamera, Scene, TorusGeometry } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let {
		autoRotate = true,
		baseColor = "#000000",
		fresnelColor = "#ffffff",
		power = 1,
		width = 1,
		height = 1,
		aspect = width / height,
	} = $props();

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 4);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const controls = new OrbitControls(camera);

	$effect(() => {
		controls.autoRotate = autoRotate;
	});

	const geometry = new TorusGeometry();

	const uniforms = createUniforms();
	const material = new FresnelMaterial(uniforms);

	const mesh = new Mesh(geometry, material);
	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			material.dispose();
			geometry.dispose();
		};
	});

	$effect(() => {
		uniforms.uBaseColor.value.set(baseColor);
	});

	$effect(() => {
		uniforms.uFresnelColor.value.set(fresnelColor);
	});

	$effect(() => {
		uniforms.uPower.value = power;
	});

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);
</script>

<canvas
	{@attach renderer((renderer) => {
		$effect(() => {
			renderer.setSize(width, height);
		});

		$effect(() => {
			renderer.setPixelRatio(pixelRatio);
		});

		controls.connect(renderer.domElement);

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
			controls.disconnect();
		};
	})}
>
</canvas>
