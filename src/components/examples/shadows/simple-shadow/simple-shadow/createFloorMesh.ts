import type { MeshBasicMaterialParameters } from "three";
import { Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

export const createFloorMesh = (
	size = 1,
	materialParameters?: MeshBasicMaterialParameters,
) => {
	const geometry = new PlaneGeometry(size, size);
	const material = new MeshBasicMaterial(materialParameters);

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
