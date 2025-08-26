<script lang="ts">
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import type { CreateRendererAttachment } from "@types";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		AmbientLight,
		DirectionalLight,
		DirectionalLightHelper,
		Mesh,
		MeshNormalMaterial,
		MeshPhongMaterial,
		PerspectiveCamera,
		Plane,
		PlaneGeometry,
		Scene,
		TorusKnotGeometry,
		Vector3,
		Vector4,
		WebGLRenderer,
	} from "three";
	import type { WebGLRendererParameters } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { ShadowMesh } from "three/examples/jsm/objects/ShadowMesh.js";

	let canvasWidth = $state(1);
	let aspect = $state(4 / 3);

	const canvasHeight = $derived(canvasWidth / aspect);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const geometry = new TorusKnotGeometry();
	const material = new MeshNormalMaterial();
	const mesh = new Mesh(geometry, material);
	mesh.translateY(2);

	const shadowMesh = new ShadowMesh(mesh);

	const light = new DirectionalLight();
	light.position.set(7, 7, -5);
	light.target = mesh;

	const lightHelper = new DirectionalLightHelper(light);

	const light4D = new Vector4(...light.position, 0.001);

	const size = 15;
	const floorGeometry = new PlaneGeometry(size, size);
	const floorMaterial = new MeshPhongMaterial();
	const floor = new Mesh(floorGeometry, floorMaterial);
	floor.rotateX(-1 * 0.5 * Math.PI);

	const objects = [mesh, shadowMesh, light, floor, lightHelper];

	const scene = new Scene().add(...objects);

	$effect(() => {
		return () => {
			scene.remove(...objects);
			geometry.dispose();
			material.dispose();
			floorGeometry.dispose();
			floorMaterial.dispose();
			light.dispose();
			lightHelper.dispose();
		};
	});

	const camera = new PerspectiveCamera();
	camera.position.set(15, 15, 10);
	camera.lookAt(scene.position);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const groundY = 0;
	const planeOffset = 0.01;
	const planeConstant = groundY + planeOffset;

	const yHat = new Vector3(0, 1, 0);
	const plane = new Plane(yHat, planeConstant); //offset the plane slightly from the ground

	let rendererParameters = $state<WebGLRendererParameters>({
		antialias: true,
		stencil: true,
	});

	const controls = new OrbitControls(camera);
	controls.maxPolarAngle = (2 / 5) * Math.PI;

	const createAttachment: CreateRendererAttachment = (rendererParameters) => {
		return (canvas) => {
			const renderer = new WebGLRenderer({ canvas, ...rendererParameters });

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(canvasWidth, canvasHeight);
				render();
			});

			$effect(() => {
				renderer.setPixelRatio(pixelRatio);
				render();
			});

			controls.connect(renderer.domElement);

			const loop = () => {
				render();
				mesh.rotateY(0.01);
				shadowMesh.update(plane, light4D);
			};

			renderer.setAnimationLoop(loop);

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
