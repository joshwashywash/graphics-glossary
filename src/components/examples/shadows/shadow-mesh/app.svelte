<script
	lang="ts"
	module
>
	// reusable scratch vector
	const translationAxis = new Vector3();
</script>

<script lang="ts">
	import { createFloor } from "./createFloor";
	import { createMesh } from "./createMesh";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import type { CreateRendererAttachment } from "@types";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		DirectionalLight,
		DirectionalLightHelper,
		PerspectiveCamera,
		Plane,
		Scene,
		Vector3,
		Vector4,
		WebGLRenderer,
	} from "three";
	import type { Object3D, WebGLRendererParameters } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { ShadowMesh } from "three/examples/jsm/objects/ShadowMesh.js";

	let canvasWidth = $state(1);
	let aspect = $state(4 / 3);

	const canvasHeight = $derived(canvasWidth / aspect);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const { mesh, dispose: disposeMesh } = createMesh();
	mesh.translateY(2);

	const shadowMesh = new ShadowMesh(mesh);

	const floorSize = 15;
	const floorColor = "#ccccaa";

	// offset the plane slightly from the ground
	const floorY = 0;
	const planeOffset = 0.01;
	const planeConstant = floorY + planeOffset;

	const yHat = new Vector3(0, 1, 0);
	const plane = new Plane(yHat, planeConstant);

	const { mesh: floorMesh, dispose: disposeFloor } = createFloor(
		floorSize,
		floorColor,
	);

	floorMesh.lookAt(plane.normal);

	const light = new DirectionalLight().translateOnAxis(
		translationAxis.set(1, 1, -1).normalize(),
		7,
	);
	light.target = mesh;

	const lightHelper = new DirectionalLightHelper(light);

	const light4D = new Vector4(...light.position, 0.01);

	const objects: Object3D[] = [mesh, shadowMesh, floorMesh, lightHelper];

	const scene = new Scene().add(...objects);

	$effect(() => {
		return () => {
			scene.remove(...objects);
			disposeMesh();
			disposeFloor();
			lightHelper.dispose();
			light.dispose();
		};
	});

	const camera = new PerspectiveCamera().translateOnAxis(
		translationAxis.set(3, 3, 2).normalize(),
		20,
	);
	camera.lookAt(scene.position);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	let rendererParameters = $state<WebGLRendererParameters>({
		antialias: true,
		stencil: true,
	});

	const controls = new OrbitControls(camera);
	controls.maxPolarAngle = (2 / 5) * Math.PI;

	const createAttachment: CreateRendererAttachment = (rendererParameters) => {
		const rotationSpeed = 1 / 100;
		return (canvas) => {
			const renderer = new WebGLRenderer({ canvas, ...rendererParameters });

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(canvasWidth, canvasHeight);
			});

			$effect(() => {
				renderer.setPixelRatio(pixelRatio);
			});

			controls.connect(renderer.domElement);

			renderer.setAnimationLoop(() => {
				render();
				mesh.rotateY(Math.PI * rotationSpeed);
				shadowMesh.update(plane, light4D);
			});

			return () => {
				controls.disconnect();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		};
	};
</script>

<div bind:clientWidth={canvasWidth}>
	<canvas {@attach createAttachment(rendererParameters)}></canvas>
</div>
