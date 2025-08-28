import { Material, Mesh, PlaneGeometry } from "three";

export const createShadowMesh = (material: Material, size = 1) => {
	const geometry = new PlaneGeometry(size, size);

	const dispose = () => {
		geometry.dispose();
	};

	const mesh = new Mesh(geometry, material);

	return {
		dispose,
		mesh,
	};
};
