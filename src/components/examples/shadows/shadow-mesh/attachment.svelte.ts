import { createFloor } from "./createFloor";
import { createMesh } from "./createMesh";
import type { State } from "./state.svelte";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import { devicePixelRatio } from "svelte/reactivity/window";
import {
	DirectionalLight,
	DirectionalLightHelper,
	Object3D,
	PerspectiveCamera,
	Plane,
	Scene,
	Vector3,
	Vector4,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ShadowMesh } from "three/examples/jsm/objects/ShadowMesh.js";

const _yHat = new Vector3(0, 1, 0);
const _translationAxis = new Vector3();

export const createShadowMesh = (
	state: State,
): { attachment: Attachment<HTMLCanvasElement>; dispose(): void } => {
	const { mesh, dispose: disposeMesh } = createMesh();
	mesh.translateY(2);

	const shadowMesh = new ShadowMesh(mesh);

	const floorSize = 15;
	const floorColor = "#ccccaa";

	// offset the plane slightly from the ground
	const floorY = 0;
	const planeOffset = 0.01;
	const planeConstant = floorY + planeOffset;

	const plane = new Plane(_yHat, planeConstant);

	const { mesh: floorMesh, dispose: disposeFloor } = createFloor(
		floorSize,
		floorColor,
	);

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

	const camera = new PerspectiveCamera().translateOnAxis(
		_translationAxis.set(3, 3, 2).normalize(),
		20,
	);
	camera.lookAt(scene.position);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const controls = new OrbitControls(camera);
	controls.maxPolarAngle = (2 / 5) * Math.PI;

	const rotationSpeed = 1 / 100;

	return {
		attachment(canvas) {
			$effect(() => {
				updateCameraAspect(state.aspect);
			});

			const renderer = new WebGLRenderer({
				canvas,
				...state.rendererParameters,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(state.canvasWidth, state.canvasHeight);
			});

			$effect(() => {
				renderer.setPixelRatio(devicePixelRatio.current ?? 1);
			});

			controls.connect(renderer.domElement);

			renderer.setAnimationLoop(() => {
				render();
				mesh.rotateY(Math.PI * rotationSpeed);
				shadowMesh.update(plane, lightPosition4D);
			});

			return () => {
				controls.disconnect();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		},
		dispose() {
			scene.remove(...objects);
			disposeMesh();
			disposeFloor();
			lightHelper.dispose();
			light.dispose();
		},
	};
};
