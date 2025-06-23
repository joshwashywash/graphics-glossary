import {
	CanvasTexture,
	NearestFilter,
	RepeatWrapping,
	Sprite,
	SpriteMaterial,
} from "three";

export const createSprite = (width: number, height: number) => {
	const canvas = new OffscreenCanvas(width, height);

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

	const dispose = () => {
		material.map = null;
		map.dispose();
		material.dispose();
	};

	const state = {
		offset: -1,
	};

	return {
		canvas,
		dispose,
		map,
		sprite,
		state,
	};
};
