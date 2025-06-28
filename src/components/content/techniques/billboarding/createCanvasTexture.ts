import { CanvasTexture, NearestFilter, RepeatWrapping } from "three";

export const createCanvasTexture = (
	canvas: TexImageSource | OffscreenCanvas,
): CanvasTexture => {
	const texture = new CanvasTexture(canvas);

	texture.minFilter = NearestFilter;
	texture.magFilter = NearestFilter;

	texture.generateMipmaps = false;

	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;

	return texture;
};
