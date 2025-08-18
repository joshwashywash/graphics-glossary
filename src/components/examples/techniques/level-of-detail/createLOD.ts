import type { LodLevel } from "./types";

import { IcosahedronGeometry, LOD, Mesh, MeshNormalMaterial } from "three";
import type { BufferGeometry } from "three";

export const createLOD = (distances: number[] = []) => {
	const levels: LodLevel[] = [];
	const material = new MeshNormalMaterial({
		wireframe: true,
	});

	const geometries: BufferGeometry[] = [];

	for (let i = 0, l = distances.length; i < l; i += 1) {
		const detail = l - i - 1;
		const geometry = new IcosahedronGeometry(1, detail);
		geometries.push(geometry);
		const object = new Mesh(geometry, material);
		const distance = distances[i];
		levels.push({
			object,
			distance,
		});
	}

	const lod = levels.reduce((lod, { distance, hysteresis, object }) => {
		return lod.addLevel(object, distance, hysteresis);
	}, new LOD());

	const dispose = () => {
		for (const distance of distances) {
			lod.removeLevel(distance);
		}

		for (const geometry of geometries) {
			geometry.dispose();
		}

		material.dispose();
	};

	return {
		dispose,
		lod,
	};
};
