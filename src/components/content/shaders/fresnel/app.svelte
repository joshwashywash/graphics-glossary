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
		TorusGeometry,
	} from "three";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";
	import { VertexNormalsHelper } from "three/addons/helpers/VertexNormalsHelper.js";

	const geometry = new TorusGeometry();
	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
	});

	const mesh = new Mesh(geometry, material);
	const helper = new VertexNormalsHelper(mesh, 0.1, 0xff_ff_ff);
	helper.visible = false;

	const scene = new Scene().add(mesh).add(helper);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();

			scene.remove(helper);
			helper.dispose();
		};
	});

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 5);
	camera.lookAt(mesh.position);

	const controls = new OrbitControls(camera);
	controls.autoRotate = true;

	const setup: Setup = (renderer) => {
		const width = renderer.domElement.clientWidth;
		const height = 0.5 * width;

		renderer.setSize(width, height);

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		controls.connect(renderer.domElement);

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

<div class="relative">
	<fieldset class="absolute left-2 space-x-2">
		<label>
			<input
				type="checkbox"
				bind:checked={
					() => helper.visible,
					(value) => {
						helper.visible = value;
					}
				}
			/>
			show vertex normals
		</label>
		<label>
			<input
				type="checkbox"
				bind:checked={
					() => controls.autoRotate,
					(value) => {
						controls.autoRotate = value;
					}
				}
			/>
			auto-rotate camera
		</label>
	</fieldset>
	<canvas
		class="w-full"
		{@attach renderer(setup)}
	>
	</canvas>
</div>
