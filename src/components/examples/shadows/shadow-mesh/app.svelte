<script
	lang="ts"
	module
>
	const _yHat = new Vector3(0, 1, 0);
	const _translationAxis = new Vector3();
</script>

<script lang="ts">
	import {
		State,
		createRendererAttachment,
	} from "@attachments/createRendererAttachment.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

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

	const plane = new Plane(_yHat, planeConstant);

	const floorSize = 15;
	const floorColor = "#ccccaa";
	const floorGeometry = new PlaneGeometry(floorSize, floorSize);
	const floorMaterial = new MeshBasicMaterial({ color: floorColor });
	const floorMesh = new Mesh(floorGeometry, floorMaterial);

	floorMesh.lookAt(plane.normal);

	const light = new DirectionalLight().translateOnAxis(
		_translationAxis.set(1, 1, -1).normalize(),
		7,
	);

	light.target = mesh;

	const lightHelper = new DirectionalLightHelper(light);

	const lightPosition4D = new Vector4(...light.position, 0.01);

	const objects: Object3D[] = [mesh, shadowMesh, floorMesh, lightHelper];

	const scene = new Scene().add(...objects);
	$effect(() => {
		return () => {
			scene.remove(...objects);
			geometry.dispose();
			material.dispose();
			floorGeometry.dispose();
			floorMaterial.dispose();
			lightHelper.dispose();
			light.dispose();
		};
	});

	const camera = new PerspectiveCamera().translateOnAxis(
		_translationAxis.set(3, 3, 2).normalize(),
		20,
	);
	camera.lookAt(scene.position);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const s = new State();
	s.rendererParameters = { antialias: true, stencil: true };
	$effect(() => {
		updateCameraAspect(s.aspect);
	});

	const rotationSpeed = (1 / 180) * Math.PI;

	s.withRenderer = (renderer) => {
		renderer.setAnimationLoop(() => {
			mesh.rotateY(Math.PI * rotationSpeed);
			shadowMesh.update(plane, lightPosition4D);
			renderer.render(scene, camera);
		});
		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div bind:clientWidth={s.canvasWidth}>
	<canvas {@attach createRendererAttachment(s)}></canvas>
</div>
