<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";

	import { attachment } from "@attachments/attachment.svelte";
	import type { WithRenderer } from "@attachments/attachment.svelte";

	import { LoopState } from "@classes/loopState";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { Checkbox, Color, List, Pane, Slider } from "svelte-tweakpane-ui";
	import type { ListOptions } from "svelte-tweakpane-ui";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import { Mesh, PerspectiveCamera, Scene, TorusGeometry } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let canvasWidth = $state(1);
	let aspect = $state(16 / 9);
	const canvasHeight = $derived(canvasWidth / aspect);

	let autoRotate = $state(true);
	let baseColor = $state("#000000");
	let fresnelColor = $state("#ffffff");
	let power = $state(1);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const aspects: ListOptions<number> = {
		"3:2": 3 / 2,
		"4:3": 4 / 3,
		"16:9": 16 / 9,
	} as const;

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 4);

	const controls = new OrbitControls(camera);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const geometry = new TorusGeometry();

	const uniforms = createUniforms();
	const material = new FresnelMaterial(uniforms);

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const loopState = new LoopState();

	const withRenderer: WithRenderer = (renderer) => {
		const render = () => {
			renderer.render(scene, camera);
		};

		$effect(() => {
			updateCameraAspect(aspect);
			if (!loopState.looping) render;
		});

		$effect(() => {
			uniforms.uBaseColor.value.set(baseColor);
			if (!loopState.looping) render();
		});

		$effect(() => {
			uniforms.uFresnelColor.value.set(fresnelColor);
			if (!loopState.looping) render();
		});

		$effect(() => {
			uniforms.uPower.value = power;
			if (!loopState.looping) render();
		});

		$effect(() => {
			renderer.setSize(canvasWidth, canvasHeight);
			if (!loopState.looping) render();
		});

		$effect(() => {
			renderer.setPixelRatio(pixelRatio);
			if (!loopState.looping) render();
		});

		$effect(() => {
			if ((controls.autoRotate = autoRotate)) {
				renderer.setAnimationLoop(
					(loopState.loop = () => {
						controls.update();
						renderer.render(scene, camera);
					}),
				);

				return () => {
					renderer.setAnimationLoop((loopState.loop = null));
				};
			} else {
				controls.addEventListener("change", render);

				return () => {
					controls.removeEventListener("change", render);
				};
			}
		});

		controls.connect(renderer.domElement);

		return () => {
			controls.disconnect();
		};
	};
</script>

<div bind:clientWidth={canvasWidth}>
	<canvas {@attach attachment(withRenderer)}></canvas>
</div>

<div class="not-content">
	<Pane
		position="inline"
		title="fresnel effect"
	>
		<Checkbox
			bind:value={autoRotate}
			label="auto rotate"
		/>
		<Color
			bind:value={baseColor}
			label="base color"
		/>
		<Color
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
		<List
			bind:value={aspect}
			options={aspects}
			label="aspect ratio"
		/>
	</Pane>
</div>
