<script lang="ts">
	import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";
	import Pane from "./pane.svelte";

	import { attachment } from "@attachments/attachment.svelte";
	import type { WithRenderer } from "@attachments/attachment.svelte";

	import { LoopState } from "@classes/loopState";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import { Mesh, MeshBasicMaterial, PerspectiveCamera, Scene } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let autoRotate = $state(true);

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
	camera.position.set(0, 0, 3);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const controls = new OrbitControls(camera);

	const loopState = new LoopState();

	const withRenderer: WithRenderer = (renderer) => {
		const render = () => {
			renderer.render(scene, camera);
		};

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
			if ((controls.autoRotate = autoRotate)) {
				renderer.setAnimationLoop(
					(loopState.loop = () => {
						controls.update();
						render();
					}),
				);

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
		};
	};
</script>

<div
	bind:clientWidth={canvasWidth}
	class="sm:relative"
>
	<canvas {@attach attachment(withRenderer)}></canvas>
	<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
		<Pane
			bind:aspect
			bind:autoRotate
		/>
	</div>
</div>
