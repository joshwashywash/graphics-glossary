<script lang="ts">
	import { createAttachment } from "./pane";

	import { Size } from "@classes/Size.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import { untrack } from "svelte";
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

	onCleanup(() => {
		ringGeometry.dispose();
		ringMaterial.dispose();
		maskGeometry.dispose();
		maskMaterial.dispose();
		meshMaterial.dispose();
		meshGeometry.dispose();
	});

	const group = new Group().add(ringMesh, maskMesh).translateZ(1);

	const scene = new Scene().add(mesh, group);

	const camera = new PerspectiveCamera();
	camera.translateZ(5);
	camera.lookAt(scene.position);

	const canvasSize = new Size();
	$effect(() => {
		camera.aspect = canvasSize.aspect;
		camera.updateProjectionMatrix();
	});

	let invert = $state(false);
	const meshMaterialStencilFunc = $derived(
		invert ? NotEqualStencilFunc : EqualStencilFunc,
	);

	const pane = createAttachment({
		get invert() {
			return untrack(() => invert);
		},
		set invert(value) {
			invert = value;
		},
	});
</script>

<div
	bind:clientWidth={canvasSize.width}
	class="relative"
>
	<div
		class="absolute top-2 right-2 not-content"
		{@attach pane}
	></div>
	<canvas
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				canvas,
				stencil: true,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			const controls = new TransformControls(camera, renderer.domElement);
			controls.showZ = false;
			controls.attach(group);
			controls.addEventListener("change", render);

			const helper = controls.getHelper();
			scene.add(helper);

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
				render();
			});

			$effect(() => {
				meshMaterial.stencilFunc = meshMaterialStencilFunc;
				render();
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
				scene.remove(helper);
				controls.removeEventListener("change", render);
				controls.detach().dispose();
			};
		}}
	>
	</canvas>
</div>
