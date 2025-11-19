<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";
	import { onDispatcherChange } from "@functions/onDispatcherChange";
	import { updateCameraAspect } from "@functions/updateCameraAspect";

	import {
		CircleGeometry,
		EqualStencilFunc,
		Group,
		Mesh,
		MeshBasicMaterial,
		MeshNormalMaterial,
		NotEqualStencilFunc,
		PerspectiveCamera,
		ReplaceStencilOp,
		RingGeometry,
		Scene,
		TorusKnotGeometry,
		WebGLRenderer,
	} from "three";
	import { TransformControls } from "three/addons/controls/TransformControls.js";

	const stencilRef = 1;

	const maskMaterial = new MeshBasicMaterial({
		colorWrite: false,
		depthTest: false,
		stencilRef,
		stencilWrite: true,
		stencilZPass: ReplaceStencilOp,
	});

	const maskGeometry = new CircleGeometry();
	const maskMesh = new Mesh(maskGeometry, maskMaterial);

	const meshGeometry = new TorusKnotGeometry();
	const meshMaterial = new MeshNormalMaterial({
		stencilRef,
		stencilWrite: true,
	});

	const ringGeometry = new RingGeometry(1, 1.05);
	const ringMaterial = new MeshBasicMaterial();

	const ringMesh = new Mesh(ringGeometry, ringMaterial);
	const mesh = new Mesh(meshGeometry, meshMaterial);

	const group = new Group().add(ringMesh, maskMesh).translateZ(1);

	const scene = new Scene().add(mesh, group);

	const camera = new PerspectiveCamera().translateZ(5);
	camera.lookAt(scene.position);

	let invert = $state(false);
	const meshMaterialStencilFunc = $derived(
		invert ? NotEqualStencilFunc : EqualStencilFunc,
	);

	const canvasSize = new Size();

	const controls = new TransformControls(camera).attach(group);
	controls.showZ = false;

	const helper = controls.getHelper();
	scene.add(helper);

	onCleanup(() => {
		ringGeometry.dispose();
		ringMaterial.dispose();
		maskGeometry.dispose();
		maskMaterial.dispose();
		meshMaterial.dispose();
		meshGeometry.dispose();
		helper.dispose();
	});
</script>

<Example>
	{#snippet pane()}
		<details open>
			<summary>mask</summary>
			<Label>
				invert
				<input
					type="checkbox"
					bind:checked={invert}
				/>
			</Label>
		</details>
	{/snippet}

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
				stencil: true,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);

				const aspect = canvasSize.width / canvasSize.height;

				updateCameraAspect(camera, aspect);
				render();
			});

			$effect(() => {
				meshMaterial.stencilFunc = meshMaterialStencilFunc;
				render();
			});

			controls.connect(renderer.domElement);

			const removeOnChangeListener = onDispatcherChange(controls, render);

			return () => {
				removeOnChangeListener();
				controls.detach().dispose();
				renderer.dispose();
			};
		}}
	>
	</canvas>
</Example>
