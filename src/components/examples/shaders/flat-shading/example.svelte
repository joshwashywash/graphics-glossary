<script lang="ts">
	import { renderer } from "@attachments/renderer.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		SphereGeometry,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let {
		flatShading = true,
		autoRotate = true,
		canvasWidth = 1,
		canvasHeight = 1,
		aspect = canvasWidth / canvasHeight,
	} = $props();

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 3);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const controls = new OrbitControls(camera);

	const geometry = new SphereGeometry(1, 16, 8);
	const material = new MeshNormalMaterial();
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
		material.flatShading = flatShading;
		material.needsUpdate = true;
	});

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);
</script>

<canvas
	{@attach renderer((renderer) => {
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
			renderer.setAnimationLoop(() => {
				controls.update();
			});

			return () => {
				renderer.setAnimationLoop(null);
			};
		});

		return () => {
			controls.removeEventListener("change", render);
			controls.disconnect();
		};
	})}
>
</canvas>
