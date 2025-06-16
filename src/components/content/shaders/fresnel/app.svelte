<script lang="ts">
	import fragmentShader from "./fragment.glsl?raw";
	import vertexShader from "./vertex.glsl?raw";

	import Size from "@classes/Size.svelte";

	import Canvas from "@components/canvas.svelte";
	import Example from "@components/example.svelte";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";
	import { createAutoRotateControls } from "@functions/createAutoRotateControls.svelte";

	import {
		Checkbox,
		Element,
		Pane,
		Slider,
		Color as TweakpaneColor,
	} from "svelte-tweakpane-ui";
	import {
		Color,
		Mesh,
		Scene,
		ShaderMaterial,
		TorusGeometry,
		Uniform,
	} from "three";

	let autoRotate = $state(true);

	let baseColor = $state("#000000");
	let fresnelColor = $state("#ffffff");
	let power = $state(1);

	const geometry = new TorusGeometry();

	const uBaseColor = new Uniform(new Color());
	const uFresnelColor = new Uniform(new Color());
	const uPower = new Uniform(1);

	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
		uniforms: {
			uBaseColor,
			uFresnelColor,
			uPower,
		},
	});

	$effect(() => {
		return () => {
			geometry.dispose();
			material.dispose();
		};
	});

	$effect(() => {
		uBaseColor.value.set(baseColor);
	});

	$effect(() => {
		uFresnelColor.value.set(fresnelColor);
	});

	$effect(() => {
		uPower.value = power;
	});

	const scene = new Scene();
	const addToScene = createAdd(() => scene);

	const mesh = new Mesh(geometry, material);
	addToScene(() => mesh);

	const size = new Size();

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 5);

	const controls = createAutoRotateControls(camera, () => autoRotate);
</script>

<Example>
	<Pane
		position="inline"
		title="schlick"
	>
		<Element>
			<div bind:clientWidth={size.width}>
				<Canvas
					getWidth={() => size.width}
					getHeight={() => size.height}
					withRenderer={(renderer) => {
						controls.connect(renderer.domElement);

						renderer.setAnimationLoop(() => {
							controls.update();
							renderer.render(scene, camera);
						});

						return () => {
							renderer.setAnimationLoop(null);
							controls.disconnect();
						};
					}}
				/>
			</div>
		</Element>
		<Checkbox
			bind:value={autoRotate}
			label="auto rotate"
		/>
		<TweakpaneColor
			bind:value={baseColor}
			label="base color"
		/>
		<TweakpaneColor
			bind:value={fresnelColor}
			label="fresnel color"
		/>
		<Slider
			bind:value={power}
			label="power"
			min={0}
			max={5}
			step={0.1}
		/>
	</Pane>
</Example>
