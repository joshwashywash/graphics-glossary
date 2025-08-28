<script lang="ts">
	import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";
	import Pane from "./pane.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import type { CreateRendererAttachment } from "@types";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		WebGLRenderer,
	} from "three";
	import type { WebGLRendererParameters } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let useAutoRotate = $state(true);

	let canvasWidth = $state(1);

	let aspect = $state(4 / 3);

	const canvasHeight = $derived(canvasWidth / aspect);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const geometry = new VertexColorsBoxGeometry();
	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			material.dispose();
			geometry.dispose();
		};
	});

	const camera = new PerspectiveCamera();
	camera.translateZ(3);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const controls = new OrbitControls(camera);

	let rendererParameters = $state<WebGLRendererParameters>({
		antialias: true,
	});

	const vertexColors: CreateRendererAttachment = (rendererParameters) => {
		let loop: null | (() => void) = null;

		const isLooping = () => loop !== null;

		return (canvas) => {
			const renderer = new WebGLRenderer({ canvas, ...rendererParameters });

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				updateCameraAspect(aspect);
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
	<canvas {@attach vertexColors(rendererParameters)}></canvas>
	<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
		<Pane
			bind:aspect
			bind:useAutoRotate
		/>
	</div>
</div>
