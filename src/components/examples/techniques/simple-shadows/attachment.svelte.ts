import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import {
	CanvasTexture,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	Object3D,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SphereGeometry,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const removeAllChildren = (object: Object3D) => {
	for (const child of object.children) {
		child.removeFromParent();
	}
};

const createShadow = (context: OffscreenCanvasRenderingContext2D) => {
	const textureCanvasHalfSize = 0.5 * context.canvas.width;
	const gradient = context.createRadialGradient(
		textureCanvasHalfSize,
		textureCanvasHalfSize,
		0,
		textureCanvasHalfSize,
		textureCanvasHalfSize,
		textureCanvasHalfSize,
	);
	gradient.addColorStop(0, "black");
	gradient.addColorStop(1, "rgba(0,0,0,0)");
	context.fillStyle = gradient;
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);
};

type Getters = {
	getAspect: () => number;
	getPixelRatio: () => number;
	getCanvasWidth: () => number;
	getCanvasHeight: () => number;
};

type Disposable = {
	dispose(): void;
};

export const createAttachment = ({
	getAspect,
	getPixelRatio,
	getCanvasHeight,
	getCanvasWidth,
}: Getters): Attachment<HTMLCanvasElement> => {
	const disposables: Disposable[] = [];

	const sphereRadius = 1;
	const sphereGeometry = new SphereGeometry(sphereRadius);
	disposables.push(sphereGeometry);

	const sphereMaterial = new MeshNormalMaterial();
	disposables.push(sphereMaterial);

	const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);
	sphereMesh.position.y = 2;

	const sphereDiameter = 2 * sphereRadius;

	const textureCanvasSize = 128;
	const textureCanvas = new OffscreenCanvas(
		textureCanvasSize,
		textureCanvasSize,
	);

	const context = textureCanvas.getContext("2d");
	// can't really do anything if the conext is null so just let the boundary catch the error
	if (context === null) {
		throw new Error("canvas texture context is null");
	}

	createShadow(context);

	const texture = new CanvasTexture(textureCanvas);

	const shadowGeometry = new PlaneGeometry(sphereDiameter, sphereDiameter);
	disposables.push(shadowGeometry);

	const shadowMaterial = new MeshBasicMaterial({
		depthTest: false,
		depthWrite: false,
		map: texture,
		opacity: 0.5,
		transparent: true,
	});
	disposables.push(shadowMaterial);

	const shadowMesh = new Mesh(shadowGeometry, shadowMaterial);

	const floorSize = 6;
	const floorGeometry = new PlaneGeometry(floorSize, floorSize);
	disposables.push(floorGeometry);

	const floorMaterial = new MeshBasicMaterial();
	disposables.push(floorMaterial);

	const floorMesh = new Mesh(floorGeometry, floorMaterial);

	const group = new Group().add(shadowMesh, floorMesh);
	group.rotateX(-1 * 0.5 * Math.PI);

	const scene = new Scene().add(sphereMesh, group);

	const disposeScene = () => {
		removeAllChildren(scene);
		removeAllChildren(group);

		for (const disposable of disposables) {
			disposable.dispose();
		}

		texture.dispose();
	};

	const camera = new PerspectiveCamera();
	camera.position.setScalar(4);
	camera.lookAt(sphereMesh.position);
	const updateCameraAspect = createUpdateCameraAspect(camera);

	const controls = new OrbitControls(camera);

	return (canvas) => {
		$effect(() => {
			updateCameraAspect(getAspect());
		});

		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		const render = () => {
			renderer.render(scene, camera);
		};

		controls.addEventListener("change", render);
		controls.connect(renderer.domElement);

		$effect(() => {
			renderer.setSize(getCanvasWidth(), getCanvasHeight());
			render();
		});

		$effect(() => {
			renderer.setPixelRatio(getPixelRatio());
			render();
		});

		return () => {
			controls.removeEventListener("change", render);
			controls.disconnect();
			disposeScene();
			renderer.dispose();
		};
	};
};
