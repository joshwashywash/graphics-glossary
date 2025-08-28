<script lang="ts">
	import { FresnelMaterial, createUniforms } from "./FresnelMaterial";
	import Pane from "./pane.svelte";

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

	let useAutoRotate = $state(true);
	let baseColor = $state("#000000");
	let fresnelColor = $state("#ffffff");
	let power = $state(1);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const camera = new PerspectiveCamera();
	camera.translateZ(4);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const controls = new OrbitControls(camera);

	const geometry = new TorusGeometry();

	const uniforms = createUniforms();
	const material = new FresnelMaterial(uniforms);
	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();
		};
	});

	let rendererParameters = $state<WebGLRendererParameters>({
		antialias: true,
	});

	const fresnel: CreateRendererAttachment = (rendererParameters) => {
		let loop: null | (() => void) = null;

		const isLooping = () => loop !== null;

		return (canvas) => {
			const renderer = new WebGLRenderer({ canvas, ...rendererParameters });
			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				updateCameraAspect(aspect);
				if (!isLooping()) render;
			});

			$effect(() => {
				uniforms.uBaseColor.value.set(baseColor);
				if (!isLooping()) render();
			});

			$effect(() => {
				uniforms.uFresnelColor.value.set(fresnelColor);
				if (!isLooping()) render();
			});

			$effect(() => {
				uniforms.uPower.value = power;
				if (!isLooping()) render();
			});

			$effect(() => {
				renderer.setSize(canvasWidth, canvasHeight);
				if (!isLooping()) render();
			});

			$effect(() => {
				renderer.setPixelRatio(pixelRatio);
				if (!isLooping()) render();
			});

			$effect(() => {
				if ((controls.autoRotate = useAutoRotate)) {
					renderer.setAnimationLoop(
						(loop = () => {
							controls.update();
							render();
						}),
					);

					return () => {
						renderer.setAnimationLoop((loop = null));
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
	<canvas {@attach fresnel(rendererParameters)}></canvas>
	<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
		<Pane
			bind:aspect
			bind:useAutoRotate
			bind:baseColor
			bind:fresnelColor
			bind:power
		/>
	</div>
</div>
