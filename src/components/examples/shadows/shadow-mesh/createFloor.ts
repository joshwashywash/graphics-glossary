import { Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

export const createFloor = (size = 1, color = "white") => {
	const geometry = new PlaneGeometry(size, size);
	const material = new MeshBasicMaterial({ color });

	const dispose = () => {
		geometry.dispose();
		material.dispose();
	};

	const mesh = new Mesh(geometry, material);

	return {
		dispose,
		mesh,
	};
};
