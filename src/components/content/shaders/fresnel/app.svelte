<script lang="ts">
	import Size from "@classes/Size.svelte";
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

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 5);

	const controls = new OrbitControls(camera);
	controls.autoRotate = true;

	$effect(() => {
		return () => {
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();

			scene.remove(helper);
			helper.dispose();
		};
	});

	const size = new Size();

	$effect(() => {
		camera.aspect = size.aspect;
		camera.updateProjectionMatrix();
	});

	const setup: Setup = (renderer) => {
		$effect(() => {
			renderer.setSize(size.width, size.height);
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
	};
</script>

<div
	class="relative"
	bind:clientWidth={size.width}
>
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
	<canvas {@attach renderer(setup)}></canvas>
</div>
