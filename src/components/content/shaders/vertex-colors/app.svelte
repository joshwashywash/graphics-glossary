<script lang="ts">
	import { createScene } from "./createScene";
	import Pane from "./pane.svelte";

	import type { WithRenderer } from "@attachments/renderer.svelte";
	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { PerspectiveCamera } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	const size = new Size();

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 3);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const controls = new OrbitControls(camera);

	let autoRotate = $state(true);

	$effect(() => {
		controls.autoRotate = autoRotate;
	});

	const withRenderer: WithRenderer = (renderer) => {
		controls.connect(renderer.domElement);

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
			controls.disconnect();
		};
	};

	const { dispose, scene } = createScene();

	$effect(() => {
		return dispose;
	});
</script>

<div bind:clientWidth={size.width}>
	<canvas
		{@attach renderer(
			() => size.width,
			() => size.height,
			withRenderer,
		)}
	>
	</canvas>
</div>

<div class="not-content">
	<Pane bind:autoRotate />
</div>
