<script lang="ts">
	import AspectCamera from "@classes/AspectCamera.svelte";
	import Size from "@classes/Size.svelte";
	import fragmentShader from "./fragment.glsl?raw";
	import renderer from "@attachments/renderer.svelte";
	import type { Setup } from "@attachments/renderer.svelte";
	import vertexShader from "./vertex.glsl?raw";
	import { Checkbox, Element, Pane } from "svelte-tweakpane-ui";
	import { Mesh, Scene, ShaderMaterial, TorusGeometry } from "three";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";

	const geometry = new TorusGeometry();
	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
	});

	const size = new Size();

	const camera = new AspectCamera(() => size.aspect);
	camera.position.set(0, 0, 5);

	const controls = new OrbitControls(camera);
	controls.autoRotate = true;

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();
		};
	});

	const setup: Setup = (renderer) => {
		controls.connect(renderer.domElement);

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
			controls.dispose();
		};
	};
</script>

<div
	class="not-content"
	bind:clientWidth={size.width}
>
	<Pane
		position="inline"
		title="artistic fresnel"
	>
		<Element>
			<canvas
				{@attach renderer(
					() => size.width,
					() => size.height,
					setup,
				)}
			>
			</canvas>
		</Element>
		<Checkbox
			bind:value={controls.autoRotate}
			label="auto rotate"
		/>
	</Pane>
</div>
