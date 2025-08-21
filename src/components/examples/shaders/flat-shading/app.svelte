<script lang="ts">
	import Pane from "./pane.svelte";

	import { LoopState } from "@classes/loopState";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import type { CreateRendererAttachment } from "@types";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import type { WebGLRendererParameters } from "three";
	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		SphereGeometry,
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let flatShading = $state(true);
	let autoRotate = $state(true);

	let canvasWidth = $state(1);
	let aspect = $state(4 / 3);

	const canvasHeight = $derived(canvasWidth / aspect);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 3);

	const controls = new OrbitControls(camera);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const material = new MeshNormalMaterial();
	const geometry = new SphereGeometry(1, 16, 8);
	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();
		};
	});

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

			$effect(() => {
				updateCameraAspect(aspect);
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

			$effect(() => {
				material.flatShading = flatShading;
				material.needsUpdate = true;
				if (!loopState.isLooping) render();
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
			bind:flatShading
		/>
	</div>
</div>
