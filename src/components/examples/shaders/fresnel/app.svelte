<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";
	import Pane from "./pane.svelte";

	import { LoopState } from "@classes/loopState";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import type { CreateRendererAttachment } from "@types";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		Mesh,
		PerspectiveCamera,
		Scene,
		TorusGeometry,
		WebGLRenderer,
	} from "three";
	import type { WebGLRendererParameters } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let canvasWidth = $state(1);
	let aspect = $state(4 / 3);
	const canvasHeight = $derived(canvasWidth / aspect);

	let autoRotate = $state(true);
	let baseColor = $state("#000000");
	let fresnelColor = $state("#ffffff");
	let power = $state(1);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 4);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const controls = new OrbitControls(camera);

	const geometry = new TorusGeometry();

	const uniforms = createUniforms();
	const material = new FresnelMaterial(uniforms);
	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const loopState = new LoopState();

	let rendererParameters = $state<WebGLRendererParameters>({
		antialias: true,
	});

	const createAttachment: CreateRendererAttachment = (rendererParameters) => {
		return (canvas) => {
			const renderer = new WebGLRenderer({ canvas, ...rendererParameters });
			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				updateCameraAspect(aspect);
				if (!loopState.isLooping) render;
			});

			$effect(() => {
				uniforms.uBaseColor.value.set(baseColor);
				if (!loopState.isLooping) render();
			});

			$effect(() => {
				uniforms.uFresnelColor.value.set(fresnelColor);
				if (!loopState.isLooping) render();
			});

			$effect(() => {
				uniforms.uPower.value = power;
				if (!loopState.isLooping) render();
			});

			$effect(() => {
				renderer.setSize(canvasWidth, canvasHeight);
				if (!loopState.isLooping) render();
			});

			$effect(() => {
				renderer.setPixelRatio(pixelRatio);
				if (!loopState.isLooping) render();
			});

			const loop = () => {
				controls.update();
				render();
			};

			$effect(() => {
				if ((controls.autoRotate = autoRotate)) {
					renderer.setAnimationLoop((loopState.loop = loop));

					return () => {
						renderer.setAnimationLoop((loopState.loop = null));
					};
				}
				controls.addEventListener("change", render);

				return () => {
					controls.removeEventListener("change", render);
				};
			});

			controls.connect(renderer.domElement);

			return () => {
				controls.disconnect();
				renderer.dispose();
			};
		};
	};
</script>

<div
	bind:clientWidth={canvasWidth}
	class="sm:relative"
>
	<canvas {@attach createAttachment(rendererParameters)}></canvas>
	<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
		<Pane
			bind:aspect
			bind:autoRotate
			bind:baseColor
			bind:fresnelColor
			bind:power
		/>
	</div>
</div>
