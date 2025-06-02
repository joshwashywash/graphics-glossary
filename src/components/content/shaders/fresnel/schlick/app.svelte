<script lang="ts">
	import AspectCamera from "@classes/AspectCamera.svelte";
	import Size from "@classes/Size.svelte";
	import fragmentShader from "./fragment.glsl?raw";
	import renderer from "@attachments/renderer.svelte";
	import type { Setup } from "@attachments/renderer.svelte";
	import vertexShader from "./vertex.glsl?raw";
	import { Color, Mesh, Scene, ShaderMaterial, TorusGeometry } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	const size = new Size();

	const geometry = new TorusGeometry();
	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
		uniforms: {
			uBaseColor: {
				value: new Color(0, 0, 0),
			},
			uFresnelColor: {
				value: new Color(1, 1, 1),
			},
			uPower: {
				value: 1,
			},
		},
	});

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
	bind:clientWidth={size.width}
	class="relative"
>
	<fieldset class="absolute left-2 space-x-2">
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
			auto-rotate
		</label>
		<label>
			base color
			<input
				type="color"
				bind:value={
					() => "#" + material.uniforms.uBaseColor.value.getHexString(),
					(value) => {
						material.uniforms.uBaseColor.value.set(value);
					}
				}
				step={0.1}
				max={2}
				min={0}
			/>
		</label>
		<label>
			fresnel color
			<input
				type="color"
				bind:value={
					() => "#" + material.uniforms.uFresnelColor.value.getHexString(),
					(value) => {
						material.uniforms.uFresnelColor.value.set(value);
					}
				}
				step={0.1}
				max={2}
				min={0}
			/>
		</label>
		<label>
			power
			<input
				type="number"
				bind:value={
					() => material.uniforms.uPower.value,
					(value) => {
						material.uniforms.uPower.value = value;
					}
				}
				step={0.1}
				max={2}
				min={0}
			/>
		</label>
	</fieldset>
	<canvas
		{@attach renderer(
			() => size.width,
			() => size.height,
			setup,
		)}
	>
	</canvas>
</div>
