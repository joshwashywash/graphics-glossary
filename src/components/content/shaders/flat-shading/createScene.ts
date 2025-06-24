import { Mesh, MeshNormalMaterial, Scene, SphereGeometry } from "three";

export const createScene = () => {
	const geometry = new SphereGeometry(1, 16, 8);
	const material = new MeshNormalMaterial();

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const dispose = () => {
		scene.remove(mesh);
		geometry.dispose();
		material.dispose();
	};

	return {
		dispose,
		material,
		scene,
	};
};
