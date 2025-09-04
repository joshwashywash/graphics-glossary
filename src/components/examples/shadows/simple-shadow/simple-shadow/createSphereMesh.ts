import type { MeshNormalMaterialParameters } from "three";
import { Mesh, MeshNormalMaterial, SphereGeometry } from "three";

export const createSphereMesh = (
	radius = 1,
	materialParameters?: MeshNormalMaterialParameters,
) => {
	const geometry = new SphereGeometry(radius);
	const material = new MeshNormalMaterial(materialParameters);

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
