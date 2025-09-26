<script
	lang="ts"
	module
>
	const yHat = new Vector3(0, 1, 0);
	const translationAxis = new Vector3();

	const rotationAmount = (1 / 180) * Math.PI;
</script>

<script lang="ts">
	import Canvas from "@components/canvas.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		DirectionalLight,
		DirectionalLightHelper,
		Mesh,
		MeshBasicMaterial,
		MeshNormalMaterial,
		Object3D,
		PerspectiveCamera,
		Plane,
		PlaneGeometry,
		Scene,
		TorusKnotGeometry,
		Vector3,
		Vector4,
	} from "three";
	import type { WebGLRenderer, WebGLRendererParameters } from "three";
	import { ShadowMesh } from "three/examples/jsm/objects/ShadowMesh.js";

	const geometry = new TorusKnotGeometry();
	const material = new MeshNormalMaterial();
	const mesh = new Mesh(geometry, material);
	mesh.translateY(2);

	const shadowMesh = new ShadowMesh(mesh);

	// offset the plane slightly from the ground
	const floorY = 0;
	const planeOffset = 0.01;
	const planeConstant = floorY + planeOffset;

	const plane = new Plane(yHat, planeConstant);

	const floorSize = 15;
	const floorGeometry = new PlaneGeometry(floorSize, floorSize);

	const floorMaterial = new MeshBasicMaterial({
		color: "#ccccaa",
	});

	const floorMesh = new Mesh(floorGeometry, floorMaterial);

	floorMesh.lookAt(plane.normal);

	const light = new DirectionalLight().translateOnAxis(
		translationAxis.set(1, 1, -1).normalize(),
		7,
	);

	light.target = mesh;

	const lightHelper = new DirectionalLightHelper(light);

	onCleanup(() => {
		geometry.dispose();
		material.dispose();
		floorGeometry.dispose();
		floorMaterial.dispose();
		lightHelper.dispose();
		light.dispose();
	});

	const lightPosition4D = new Vector4(...light.position, 0.01);

	const objects: Object3D[] = [mesh, shadowMesh, floorMesh, lightHelper];

	const scene = new Scene().add(...objects);

	const camera = new PerspectiveCamera().translateOnAxis(
		translationAxis.set(1, 1, 1).normalize(),
		20,
	);
	camera.lookAt(scene.position);

	const rendererParams: WebGLRendererParameters = {
		antialias: true,
		stencil: true,
	};

	const onRendererReady = (renderer: WebGLRenderer) => {
		renderer.setAnimationLoop(() => {
			mesh.rotateY(rotationAmount);
			shadowMesh.update(plane, lightPosition4D);
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};

	const onRendererResize = (renderer: WebGLRenderer) => {
		const { clientWidth, clientHeight } = renderer.domElement;
		camera.aspect = clientWidth / clientHeight;
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
	};
</script>

<Canvas
	class="w-full aspect-square"
	{rendererParams}
	{onRendererReady}
	{onRendererResize}
/>
