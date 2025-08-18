import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

export const createShadowMesh = (canvas: OffscreenCanvas, size = 1) => {
	const geometry = new PlaneGeometry(size, size);

	const map = new CanvasTexture(canvas);

	const material = new MeshBasicMaterial({
		depthWrite: false,
		map,
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
		material,
		mesh,
	};
};
