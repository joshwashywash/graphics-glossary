<script lang="ts">
	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import Example from "@components/example.svelte";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { Checkbox, Element, Pane } from "svelte-tweakpane-ui";
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

	const geometry = new SphereGeometry(1, 16, 8);
	const material = new MeshNormalMaterial();

	$effect(() => {
		material.flatShading = flatShading;
		material.needsUpdate = true;
	});

	$effect(() => {
		return () => {
			geometry.dispose();
			material.dispose();
		};
	});

	const scene = new Scene();
	const addToScene = createAdd(() => scene);

	const mesh = new Mesh(geometry, material);
	addToScene(() => mesh);

	const size = new Size();

	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);
	camera.position.set(0, 0, 3);

	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const controls = new OrbitControls(camera);
	$effect(() => {
		controls.autoRotate = autoRotate;
	});
</script>

<Example>
	<Pane
		position="inline"
		title="flat-shading"
	>
		<Element>
			<div bind:clientWidth={size.width}>
				<canvas
					{@attach renderer(
						() => size.width,
						() => size.height,
						(renderer) => {
							controls.connect(renderer.domElement);

							renderer.setAnimationLoop(() => {
								controls.update();
								renderer.render(scene, camera);

								return () => {
									renderer.setAnimationLoop(null);
									controls.disconnect();
								};
							});
						},
					)}
				>
				</canvas>
			</div>
		</Element>
		<Checkbox
			bind:value={flatShading}
			label="use flat shading"
		/>
		<Checkbox
			bind:value={autoRotate}
			label="auto rotate"
		/>
	</Pane>
</Example>
