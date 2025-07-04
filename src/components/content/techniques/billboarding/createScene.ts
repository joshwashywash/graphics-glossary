import { CanvasTexture, Scene, Sprite, SpriteMaterial } from "three";

export const createScene = (canvasTexture: CanvasTexture) => {
	const material = new SpriteMaterial({
		map: canvasTexture,
	});
	const sprite = new Sprite(material);
	const scene = new Scene().add(sprite);

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
