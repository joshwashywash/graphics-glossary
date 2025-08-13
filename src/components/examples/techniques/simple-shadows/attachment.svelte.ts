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

const createSphereMesh = (radius = 1) => {
	const geometry = new SphereGeometry(radius);
	const material = new MeshNormalMaterial();

	const dispose = () => {
		geometry.dispose();
		material.dispose();
	};

	const mesh = new Mesh(geometry, material);

	return {
		dispose,
		mesh,
	};
};

const createFloorMesh = (size = 1) => {
	const geometry = new PlaneGeometry(size, size);
	const material = new MeshBasicMaterial();

	const dispose = () => {
		geometry.dispose();
		material.dispose();
	};

	const mesh = new Mesh(geometry, material);

	return {
		dispose,
		mesh,
	};
};

const createShadowMesh = (canvas: OffscreenCanvas, size = 1) => {
	const geometry = new PlaneGeometry(size, size);

	const map = new CanvasTexture(canvas);

	const material = new MeshBasicMaterial({
		depthTest: false,
		depthWrite: false,
		map,
		opacity: 0.5,
		transparent: true,
	});

	const dispose = () => {
		geometry.dispose();
		material.dispose();
		map.dispose();
	};

	const mesh = new Mesh(geometry, material);

	return {
		dispose,
		mesh,
	};
};

const removeAllChildren = (object: Object3D) => {
	for (const child of object.children) {
		child.removeFromParent();
	}
};

const drawShadow = (context: OffscreenCanvasRenderingContext2D) => {
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

export const createAttachment = ({
	getAspect,
	getPixelRatio,
	getCanvasHeight,
	getCanvasWidth,
}: Getters): Attachment<HTMLCanvasElement> => {
	const sphereRadius = 1;

	const { dispose: disposeSphere, mesh: sphereMesh } =
		createSphereMesh(sphereRadius);
	sphereMesh.position.y = 2;

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

	drawShadow(context);

	const { dispose: disposeShadow, mesh: shadowMesh } = createShadowMesh(
		textureCanvas,
		2 * sphereRadius,
	);

	const floorSize = 6;
	const { dispose: disposeFloor, mesh: floorMesh } = createFloorMesh(floorSize);

	const group = new Group().add(shadowMesh, floorMesh);
	group.rotateX(-1 * 0.5 * Math.PI);

	const scene = new Scene().add(sphereMesh, group);

	const disposeScene = () => {
		removeAllChildren(scene);
		removeAllChildren(group);

		disposeSphere();
		disposeFloor();
		disposeShadow();
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
