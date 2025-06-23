import {
	CanvasTexture,
	NearestFilter,
	RepeatWrapping,
	Scene,
	Sprite,
	SpriteMaterial,
} from "three";

export const createScene = (width: number, height: number) => {
	const canvas = new OffscreenCanvas(width, height);
	const context = canvas.getContext("2d");

	const map = new CanvasTexture(canvas);

	map.minFilter = NearestFilter;
	map.magFilter = NearestFilter;
	map.generateMipmaps = false;
	map.wrapS = RepeatWrapping;
	map.wrapT = RepeatWrapping;

	const material = new SpriteMaterial({
		map,
	});

	const sprite = new Sprite(material);
	const scene = new Scene().add(sprite);

	const dispose = () => {
		scene.remove(sprite);

		material.map = null;
		map.dispose();
		material.dispose();
	};

	const state = {
		offset: -1,
	};

	return {
		context,
		dispose,
		map,
		scene,
		sprite,
		state,
	};
};
