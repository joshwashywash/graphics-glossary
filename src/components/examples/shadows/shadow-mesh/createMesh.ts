import { Mesh, MeshNormalMaterial, TorusKnotGeometry } from "three";

export const createMesh = () => {
	const geometry = new TorusKnotGeometry();
	const material = new MeshNormalMaterial();

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
