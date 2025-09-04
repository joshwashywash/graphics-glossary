<script lang="ts">
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import type { CreateRendererAttachment } from "@types";
	import type { WebGLRendererParameters } from "three";
	import {
		EqualStencilFunc,
		Mesh,
		MeshBasicMaterial,
		MeshNormalMaterial,
		PerspectiveCamera,
		PlaneGeometry,
		ReplaceStencilOp,
		Scene,
		SphereGeometry,
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let canvasWidth = $state(1);
	let aspect = $state(4 / 3);

	const canvasHeight = $derived(canvasWidth / aspect);

	const windowMaterial = new MeshBasicMaterial({
		colorWrite: false,
		depthTest: false,
		depthWrite: false,
		stencilWrite: true,
		stencilRef: 1,
		stencilZPass: ReplaceStencilOp,
	});
	const windowGeometry = new PlaneGeometry();
	const windowMesh = new Mesh(windowGeometry, windowMaterial);
	windowMesh.translateZ(-3);

	const geometry = new SphereGeometry();
	const material = new MeshNormalMaterial({
		stencilRef: 0,
		stencilFunc: EqualStencilFunc,
		stencilWrite: true,
	});
	const wireframeMaterial = material.clone();
	wireframeMaterial.wireframe = true;
	wireframeMaterial.stencilRef = 1;
	wireframeMaterial.stencilFunc = EqualStencilFunc;
	wireframeMaterial.stencilWrite = true;

	const mesh = new Mesh(geometry, material);
	const wireframeMesh = new Mesh(geometry, wireframeMaterial);

	const scene = new Scene().add(windowMesh, mesh, wireframeMesh);

	$effect(() => {
		return () => {
			scene.remove(mesh, wireframeMesh, windowMesh);
			geometry.dispose();
			material.dispose();
			wireframeMaterial.dispose();
			windowGeometry.dispose();
			windowMaterial.dispose();
		};
	});

	const camera = new PerspectiveCamera();
	camera.translateZ(5);

	const controls = new OrbitControls(camera);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	let rendererParameters = $state<WebGLRendererParameters>({
		antialias: true,
		stencil: true,
	});

	const wireframeWindow: CreateRendererAttachment = (rendererParameters) => {
		return (canvas) => {
			const renderer = new WebGLRenderer({ canvas, ...rendererParameters });

			$effect(() => {
				renderer.setSize(canvasWidth, canvasHeight);
			});

			renderer.setAnimationLoop(() => {
				renderer.render(scene, camera);
			});

			controls.connect(renderer.domElement);

			return () => {
				controls.disconnect();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		};
	};
</script>

<div bind:clientWidth={canvasWidth}>
	<canvas {@attach wireframeWindow(rendererParameters)}></canvas>
</div>
