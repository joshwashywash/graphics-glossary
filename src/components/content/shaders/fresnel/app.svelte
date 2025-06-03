<script lang="ts">
	import fragmentShader from "./fragment.glsl?raw";
	import vertexShader from "./vertex.glsl?raw";

	import { renderer } from "@attachments/renderer.svelte";
	import type { Setup } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import { Checkbox, Color, Element, Pane, Slider } from "svelte-tweakpane-ui";
	import {
		Mesh,
		Scene,
		ShaderMaterial,
		Color as ThreeColor,
		TorusGeometry,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	const size = new Size();

	const geometry = new TorusGeometry();
	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
		uniforms: {
			uBaseColor: {
				value: new ThreeColor(0, 0, 0),
			},
			uFresnelColor: {
				value: new ThreeColor(1, 1, 1),
			},
			uPower: {
				value: 1,
			},
		},
	});

	const camera = createAspectPerspectiveCamera(() => size.aspect);
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
	bind:clientWidth={size.width}
	class="not-content"
>
	<Pane
		position="inline"
		title="schlick"
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
		<Color
			bind:value={
				() => "#" + material.uniforms.uBaseColor.value.getHexString(),
				(value) => {
					material.uniforms.uBaseColor.value.set(value);
				}
			}
			label="base color"
		/>
		<Color
			bind:value={
				() => "#" + material.uniforms.uFresnelColor.value.getHexString(),
				(value) => {
					material.uniforms.uFresnelColor.value.set(value);
				}
			}
			label="base color"
		/>
		<Slider
			bind:value={material.uniforms.uPower.value}
			label="power"
			min={0}
			max={5}
			step={0.1}
		/>
	</Pane>
</div>
