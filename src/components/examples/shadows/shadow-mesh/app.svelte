<script
	lang="ts"
	module
>
	const yHat = new Vector3(0, 1, 0);
	const translationAxis = new Vector3();

	const DEGREES = 1;
	const ANGLE = DEG2RAD * DEGREES;

	const FLOOR_SIZE = 15;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
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
	import { DEG2RAD } from "three/src/math/MathUtils.js";

	let rotateMesh = $state(true);

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

	const floorGeometry = new PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE);

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

	useCleanup(() => {
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

	let animationLoop: null | (() => void) = null;
</script>

<div class="relative">
	<details class="example-pane">
		<summary>controls</summary>
		<Label>
			rotate mesh
			<input
				type="checkbox"
				bind:checked={rotateMesh}
			/>
		</Label>
	</details>

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

			$effect(() => {
				renderer.setPixelRatio(devicePixelRatio.current ?? 1);
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			const renderIfNotAnimating = () => {
				if (animationLoop === null) render();
			};

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);
				updateCameraAspect(camera, canvasSize.ratio);

				renderIfNotAnimating();
			});

			$effect(() => {
				if (!rotateMesh) return;

				renderer.setAnimationLoop(
					(animationLoop = () => {
						mesh.rotateY(ANGLE);
						shadowMesh.update(plane, lightPosition4D);
						renderer.render(scene, camera);

						render();
					}),
				);

				return () => {
					renderer.setAnimationLoop((animationLoop = null));
				};
			});

			return () => {
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
