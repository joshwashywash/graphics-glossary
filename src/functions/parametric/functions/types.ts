import type { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";

export type ParametricFunction = ConstructorParameters<
	typeof ParametricGeometry
>[0];
