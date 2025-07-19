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

		const render = () => {
			renderer.render(scene, camera);
		};

		controls.addEventListener("change", render);

		renderer.setAnimationLoop(() => {
			if (controls.autoRotate) {
				controls.update();
			}
		});

		$effect(() => {
			uniforms.uBaseColor.value.set(baseColor);
			render();
		});

		$effect(() => {
			uniforms.uFresnelColor.value.set(fresnelColor);
			render();
		});

		$effect(() => {
			uniforms.uPower.value = power;
			render();
		});

		return () => {
			renderer.setAnimationLoop(null);
			controls.removeEventListener("change", render);
			controls.disconnect();
		};
	})}
>
</canvas>
