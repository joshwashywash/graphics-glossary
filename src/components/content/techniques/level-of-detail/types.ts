import type { Object3D } from "three";

export type LodLevel = {
	distance?: number;
	hysteresis?: number;
	object: Object3D;
};
