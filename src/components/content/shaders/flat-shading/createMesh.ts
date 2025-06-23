import { Mesh, MeshNormalMaterial, SphereGeometry } from "three";

export const createMesh = () => {
	const geometry = new SphereGeometry(1, 16, 8);
	const material = new MeshNormalMaterial();

	const dispose = () => {
		geometry.dispose();
		material.dispose();
	};

	const mesh = new Mesh(geometry, material);

	const updateFlatShading = (flatShading: boolean) => {
		material.flatShading = flatShading;
		material.needsUpdate = true;
	};

	return {
		mesh,
		dispose,
		updateFlatShading,
	};
};
