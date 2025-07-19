<script lang="ts">
	import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";

	import { renderer } from "@attachments/renderer.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import { Mesh, MeshBasicMaterial, PerspectiveCamera, Scene } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let {
		autoRotate = true,
		width = 1,
		height = 1,
		aspect = width / height,
	} = $props();

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 3);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const geometry = new VertexColorsBoxGeometry();
	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);
	$effect(() => {
		return () => {
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();
		};
	});

	const controls = new OrbitControls(camera);

	$effect(() => {
		controls.autoRotate = autoRotate;
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

		return () => {
			renderer.setAnimationLoop(null);
			controls.removeEventListener("change", render);
			controls.disconnect();
		};
	})}
>
</canvas>
