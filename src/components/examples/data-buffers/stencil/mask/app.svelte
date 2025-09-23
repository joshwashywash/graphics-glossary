<script
	lang="ts"
	module
>
	const cameraAxis = new Vector3(0, 0, 1);
</script>

<script lang="ts">
	import { Size } from "@classes/Size.svelte";

	import { untrack } from "svelte";
	import type { Attachment } from "svelte/attachments";
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
		Vector3,
		WebGLRenderer,
	} from "three";
	import { TransformControls } from "three/addons/controls/TransformControls.js";
	import { Pane } from "tweakpane";

	const canvasSize = new Size();

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
		stencilWrite: true,
		stencilRef,
	});

	const ringGeometry = new RingGeometry(1, 1.05);
	const ringMaterial = new MeshBasicMaterial();

	const ringMesh = new Mesh(ringGeometry, ringMaterial);
	const mesh = new Mesh(meshGeometry, meshMaterial);

	const group = new Group().add(ringMesh, maskMesh);
	group.translateZ(1);

	const scene = new Scene().add(mesh, group);

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(cameraAxis, 5);
	camera.lookAt(scene.position);

	$effect(() => {
		camera.aspect = canvasSize.aspect;
		camera.updateProjectionMatrix();
	});

	$effect(() => {
		return () => {
			ringGeometry.dispose();
			ringMaterial.dispose();
			maskGeometry.dispose();
			maskMaterial.dispose();
		};
	});

	const createPane = (params: { invert: boolean }): Attachment<HTMLElement> => {
		return (container) => {
			const pane = new Pane({ container, title: "controls" });

			pane.addBinding(params, "invert");

			return () => {
				pane.dispose();
			};
		};
	};

	let invert = $state(false);

	const pane = createPane({
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

			const gizmo = controls.getHelper();
			scene.add(gizmo);

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
				render();
			});

			$effect(() => {
				meshMaterial.stencilFunc = invert
					? NotEqualStencilFunc
					: EqualStencilFunc;
				render();
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
				scene.remove(gizmo);
				controls.removeEventListener("change", render);
				controls.detach().dispose();
			};
		}}
	>
	</canvas>
</div>
