import { CanvasTexture, Scene, Sprite, SpriteMaterial } from "three";

export const createScene = (
	canvasTexture: CanvasTexture,
	scene = new Scene(),
) => {
	const material = new SpriteMaterial({
		map: canvasTexture,
	});

	const sprite = new Sprite(material);

	scene.add(sprite);

	const dispose = () => {
		scene.remove(sprite);
		sprite.material.dispose();
	};

	return {
		dispose,
		scene,
		sprite,
	};
};
