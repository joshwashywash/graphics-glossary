import { Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

export const createFloorMesh = (size = 1) => {
	const geometry = new PlaneGeometry(size, size);
	const material = new MeshBasicMaterial();

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
