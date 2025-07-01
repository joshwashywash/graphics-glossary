import { createCanvasTexture } from "./createCanvasTexture";

import { Scene, Sprite, SpriteMaterial } from "three";

export const createScene = (canvas: TexImageSource | OffscreenCanvas) => {
	const canvasTexture = createCanvasTexture(canvas);

	const material = new SpriteMaterial({ map: canvasTexture });

	const sprite = new Sprite(material);

	const scene = new Scene().add(sprite);

	const dispose = () => {
		scene.remove(sprite);
		material.map = null;
		material.dispose();
		canvasTexture.dispose();
	};

	return {
		canvasTexture,
		dispose,
		scene,
		sprite,
	};
};
