<script lang="ts">
	import Pane from "./pane.svelte";

	import type { WithRenderer } from "@attachments/renderer.svelte";
	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		SphereGeometry,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 3);

	const size = new Size();

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

	const geometry = new SphereGeometry(1, 16, 8);
	const material = new MeshNormalMaterial();
	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			material.dispose();
			geometry.dispose();
		};
	});

	let flatShading = $state(true);
	$effect(() => {
		material.flatShading = flatShading;
		material.needsUpdate = true;
	});
</script>

<div bind:clientWidth={size.width}>
	<canvas
		{@attach renderer(
			() => size.width,
			() => size.height,
			() => withRenderer,
		)}
	>
	</canvas>
</div>

<div class="not-content">
	<Pane
		bind:autoRotate
		bind:flatShading
	/>
</div>
