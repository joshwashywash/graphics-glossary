import type { ParametricFunction } from "./types";

export const pringle: ParametricFunction = (u, v, target) => {
	v *= 2 * Math.PI;
	const cosV = Math.cos(v);
	const sinV = Math.sin(v);

	const x = u * cosV;
	const y = u * sinV;
	const z = u * u * cosV * sinV;

	target.set(x, y, z);
};
