<script lang="ts">
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { aspects } from "@constants/aspects";
	import type { CreateRendererAttachment } from "@types";
	import { Checkbox, List, Pane } from "svelte-tweakpane-ui";
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

	let useFlatShading = $state(true);
	let autoRotateCamera = $state(true);

	let canvasWidth = $state(1);
	let aspect = $state(aspects["4:3"]);

	const canvasHeight = $derived(canvasWidth / aspect);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const camera = new PerspectiveCamera();
	camera.translateZ(3);

	const controls = new OrbitControls(camera);

	const updateCameraAspect = createUpdateCameraAspect(camera);

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

	let rendererParameters = $state<WebGLRendererParameters>({
		antialias: true,
	});

	const flatShading: CreateRendererAttachment = (rendererParameters) => {
		let loop: null | (() => void) = null;

		const isLooping = () => loop !== null;

		return (canvas) => {
			const renderer = new WebGLRenderer({ canvas, ...rendererParameters });
			renderer.setAnimationLoop;

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				if ((controls.autoRotate = autoRotateCamera)) {
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
				material.flatShading = useFlatShading;
				material.needsUpdate = true;
				if (!isLooping()) render();
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
	<canvas {@attach flatShading(rendererParameters)}></canvas>
	<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
		<Pane position="inline">
			<Checkbox
				bind:value={useFlatShading}
				label="use flat shading"
			/>
			<Checkbox
				bind:value={autoRotateCamera}
				label="auto rotate camera"
			/>
			<List
				bind:value={aspect}
				options={aspects}
				label="aspect ratio"
			/>
		</Pane>
	</div>
</div>
