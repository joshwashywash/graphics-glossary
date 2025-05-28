<script lang="ts">
	import fragmentShader from "./fragment.glsl?raw";
	import renderer from "@attachments/renderer.svelte";
	import type { Setup } from "@attachments/renderer.svelte";
	import vertexShader from "./vertex.glsl?raw";
	import {
		Mesh,
		PerspectiveCamera,
		Scene,
		ShaderMaterial,
		TorusKnotGeometry,
	} from "three";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";

	const geometry = new TorusKnotGeometry();
	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
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

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 5);
	camera.lookAt(mesh.position);

	const setup: Setup = (renderer) => {
		const width = renderer.domElement.clientWidth;
		const height = 0.5 * width;

		renderer.setSize(width, height);

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.autoRotate = true;

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
			controls.dispose();
			controls.domElement = null;
		};
	};
</script>

<canvas
	class="w-full"
	{@attach renderer(setup)}
>
</canvas>
