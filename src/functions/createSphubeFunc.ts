import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";

export const createSphubeFunc = (
	radius = 0.5,
	squareness = 0.8,
): ConstructorParameters<typeof ParametricGeometry>[0] => {
	return (u, v, target) => {
		const tau = 2 * Math.PI;

		u *= tau;
		v *= tau;

		const cosU = Math.cos(u);
		const sinU = Math.sin(u);
		const cosV = Math.cos(v);
		const sinV = Math.sin(v);

		const x =
			(radius * cosU * cosV) /
			Math.sqrt(
				1 - squareness * cosU * cosU * sinV * sinV - squareness * sinU * sinU,
			);

		const y =
			(radius * cosU * sinV) /
			Math.sqrt(
				1 - squareness * cosU * cosU * cosV * cosV - squareness * sinU * sinU,
			);

		const z = (radius * sinU) / Math.sqrt(1 - squareness * cosU * cosU);

		target.set(x, y, z);
	};
};
