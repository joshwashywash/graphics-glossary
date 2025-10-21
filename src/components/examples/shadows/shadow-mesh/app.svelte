<script
	lang="ts"
	module
>
	const yHat = new Vector3(0, 1, 0);
	const translationAxis = new Vector3();

	const rotationAmount = (1 / 180) * Math.PI;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

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
		WebGLRenderer,
	} from "three";
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

	const canvasSize = new Size();
</script>

<canvas
	class="w-full aspect-square"
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
			render();
		});

		$effect(() => {
			camera.aspect = canvasSize.aspect;
			camera.updateProjectionMatrix();
			render();
		});

		renderer.setAnimationLoop(() => {
			mesh.rotateY(rotationAmount);
			shadowMesh.update(plane, lightPosition4D);
			renderer.render(scene, camera);

			render();
		});

		return () => {
			renderer.setAnimationLoop(null);
			renderer.dispose();
		};
	}}
>
</canvas>
