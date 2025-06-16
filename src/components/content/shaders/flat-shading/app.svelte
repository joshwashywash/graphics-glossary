<script lang="ts">
	import Size from "@classes/Size.svelte";

	import Canvas from "@components/canvas.svelte";
	import Example from "@components/example.svelte";

	import { setSize } from "@contexts/size";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";
	import { createAutoRotateControls } from "@functions/createAutoRotateControls.svelte";

	import { Checkbox, Element, Pane } from "svelte-tweakpane-ui";
	import { Mesh, MeshNormalMaterial, Scene, SphereGeometry } from "three";

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

	const size = setSize(new Size());

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 3);

	const controls = createAutoRotateControls(camera, () => autoRotate);
</script>

<Example>
	<Pane
		position="inline"
		title="flat-shading"
	>
		<Element>
			<div bind:clientWidth={size.width}>
				<Canvas
					withRenderer={(renderer) => {
						controls.connect(renderer.domElement);

						renderer.setAnimationLoop(() => {
							controls.update();
							renderer.render(scene, camera);
						});

						return () => {
							renderer.setAnimationLoop(null);
							controls.disconnect();
						};
					}}
				/>
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
