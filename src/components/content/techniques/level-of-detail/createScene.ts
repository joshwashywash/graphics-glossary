import {
	IcosahedronGeometry,
	LOD,
	Mesh,
	MeshNormalMaterial,
	Scene,
} from "three";

export const createScene = (distances: number[]) => {
	const lod = new LOD();
	const geometries: IcosahedronGeometry[] = [];

	const material = new MeshNormalMaterial({
		wireframe: true,
	});

	for (let i = 0, l = distances.length; i < l; i += 1) {
		const detail = l - i - 1;
		const geometry = new IcosahedronGeometry(1, detail);
		geometries.push(geometry);
		const mesh = new Mesh(geometry, material);
		mesh.matrixAutoUpdate = false;

		lod.addLevel(mesh, distances[i]);
	}

	const scene = new Scene().add(lod);

	const dispose = () => {
		scene.remove(lod);

		for (const geometry of geometries) {
			geometry.dispose();
		}
		material.dispose();
	};

	return {
		dispose,
		scene,
	};
};
