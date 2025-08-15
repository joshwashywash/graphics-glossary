<script lang="ts">
	import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";

	import { attachment } from "@attachments/attachment.svelte";
	import type { WithRenderer } from "@attachments/attachment.svelte";

	import { LoopState } from "@classes/loopState";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { Checkbox, List, Pane } from "svelte-tweakpane-ui";
	import type { ListOptions } from "svelte-tweakpane-ui";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import { Mesh, MeshBasicMaterial, PerspectiveCamera, Scene } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let autoRotate = $state(true);

	let canvasWidth = $state(1);

	let aspect = $state(16 / 9);

	const canvasHeight = $derived(canvasWidth / aspect);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const aspects: ListOptions<number> = {
		"3:2": 3 / 2,
		"4:3": 4 / 3,
		"16:9": 16 / 9,
	} as const;

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
						render();
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
		title="vertex colors"
		position="inline"
	>
		<Checkbox
			bind:value={autoRotate}
			label="auto rotate"
		/>
		<List
			bind:value={aspect}
			options={aspects}
			label="aspect ratio"
		/>
	</Pane>
</div>
