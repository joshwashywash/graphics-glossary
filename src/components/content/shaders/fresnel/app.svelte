<script lang="ts">
	import fragmentShader from "./fragment.glsl?raw";
	import vertexShader from "./vertex.glsl?raw";

	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import Example from "@components/example.svelte";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

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
		PerspectiveCamera,
		Scene,
		ShaderMaterial,
		TorusGeometry,
		Uniform,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);
	camera.position.set(0, 0, 4);

	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const controls = new OrbitControls(camera);

	$effect(() => {
		controls.autoRotate = autoRotate;
	});
</script>

<Example>
	<Pane
		position="inline"
		title="schlick"
	>
		<Element>
			<div bind:clientWidth={size.width}>
				<canvas
					{@attach renderer(
						() => size.width,
						() => size.height,
						(renderer) => {
							controls.connect(renderer.domElement);

							renderer.setAnimationLoop(() => {
								controls.update();
								renderer.render(scene, camera);
							});

							return () => {
								renderer.setAnimationLoop(null);
								controls.disconnect();
							};
						},
					)}
				>
				</canvas>
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
