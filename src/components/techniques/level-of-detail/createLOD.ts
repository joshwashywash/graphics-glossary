import { IcosahedronGeometry, LOD, Material, Mesh } from "three";

export type LODItem = {
	distance: number;
	material: Material;
};

export default (
	items: LODItem[],
): {
	lod: LOD;
	meshes: Mesh[];
} => {
	const lod = new LOD();
	const meshes: Mesh[] = [];

	for (let i = 0, l = items.length; i < l; i += 1) {
		const detail = l - i - 1;
		const { distance, material } = items[i];
		const geometry = new IcosahedronGeometry(1, detail);
		const mesh = new Mesh(geometry, material);
		mesh.matrixAutoUpdate = false;
		meshes.push(mesh);
		lod.addLevel(mesh, distance);
	}

	return {
		lod,
		meshes,
	};
};
