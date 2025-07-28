<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		Mesh,
		PerspectiveCamera,
		Scene,
		TorusGeometry,
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let {
		autoRotate = true,
		baseColor = "#000000",
		fresnelColor = "#ffffff",
		power = 1,
		canvasWidth = 1,
		canvasHeight = 1,
		aspect = canvasWidth / canvasHeight,
	} = $props();

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 4);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const controls = new OrbitControls(camera);

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
	{@attach (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setSize(canvasWidth, canvasHeight);
		});

		$effect(() => {
			renderer.setPixelRatio(pixelRatio);
		});

		controls.connect(renderer.domElement);

		const render = () => {
			renderer.render(scene, camera);
		};

		controls.addEventListener("change", render);

		$effect(() => {
			controls.autoRotate = autoRotate;
			if (controls.autoRotate) {
				renderer.setAnimationLoop(() => {
					controls.update();
				});
				return () => {
					renderer.setAnimationLoop(null);
				};
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
			controls.removeEventListener("change", render);
			controls.disconnect();
			renderer.dispose();
		};
	}}
>
</canvas>
