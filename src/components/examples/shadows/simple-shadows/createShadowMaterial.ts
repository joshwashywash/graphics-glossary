import { CanvasTexture, MeshBasicMaterial } from "three";

type CanvasTextureParameters = ConstructorParameters<typeof CanvasTexture>;

export const createShadowMaterial = (...args: CanvasTextureParameters) => {
	const map = new CanvasTexture(...args);
	return new MeshBasicMaterial({
		depthWrite: false,
		map,
		transparent: true,
	});
};
