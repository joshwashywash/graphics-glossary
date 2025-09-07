import type { LodLevel } from "./types";

import { IcosahedronGeometry, LOD, Mesh, MeshNormalMaterial } from "three";
import type { BufferGeometry } from "three";

export const createLOD = (distances: number[] = [], radius = 1) => {
	const levels: LodLevel[] = [];
	const material = new MeshNormalMaterial({ flatShading: true });

	const geometries: BufferGeometry[] = [];

	for (let i = 0, l = distances.length; i < l; i += 1) {
		const geometry = new IcosahedronGeometry(radius, i);
		geometries.push(geometry);
		const object = new Mesh(geometry, material);
		const distance = distances[i];
		levels.push({
			distance,
			object,
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
