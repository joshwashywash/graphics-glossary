<script lang="ts">
	import { attachment } from "@attachments/attachment.svelte";
	import type { WithRenderer } from "@attachments/attachment.svelte";

	import { LoopState } from "@classes/loopState";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { Checkbox, List, Pane } from "svelte-tweakpane-ui";
	import type { ListOptions } from "svelte-tweakpane-ui";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		SphereGeometry,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let flatShading = $state(true);
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

	const withRenderer: WithRenderer = (renderer) => {
		const render = () => {
			renderer.render(scene, camera);
		};

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
			material.flatShading = flatShading;
			material.needsUpdate = true;
			if (!loopState.looping) render();
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
		title="flat-shading"
	>
		<Checkbox
			bind:value={flatShading}
			label="use flat shading"
		/>
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
