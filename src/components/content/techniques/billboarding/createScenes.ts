import { createCanvasTexture } from "./createCanvasTexture";

import {
	CameraHelper,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	Sprite,
	SpriteMaterial,
} from "three";

export const createScenes = (
	canvas: TexImageSource | OffscreenCanvas,
	camera: PerspectiveCamera,
) => {
	const canvasTexture = createCanvasTexture(canvas);

	const material = new SpriteMaterial({ map: canvasTexture });

	const sprite = new Sprite(material);

	const scene = new Scene().add(sprite);

	const helper = new CameraHelper(camera);

	const planeMaterial = new MeshBasicMaterial({
		map: canvasTexture,
	});

	const planeGeometry = new PlaneGeometry();

	const plane = new Mesh(planeGeometry, planeMaterial);

	const otherScene = new Scene().add(helper).add(plane);

	const dispose = () => {
		scene.remove(sprite);
		material.map = null;
		material.dispose();
		canvasTexture.dispose();
		otherScene.remove(plane).remove(helper);
		helper.dispose();
		planeMaterial.map = null;
		planeMaterial.dispose();
		planeGeometry.dispose();
	};

	return {
		canvasTexture,
		dispose,
		otherScene,
		plane,
		scene,
		sprite,
	};
};
