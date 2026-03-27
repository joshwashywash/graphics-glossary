import type { ParametricFunction } from "./types";

type SphubeFuncParameters = {
	radius: number;
	squareness: number;
};

export const createSphube = ({
	radius = 0.5,
	squareness = 0.8,
}: Partial<SphubeFuncParameters> = {}): ParametricFunction => {
	const tau = 2 * Math.PI;
	return (u, v, target) => {
		u *= tau;
		v *= tau;

		const cosU = Math.cos(u);
		const sinU = Math.sin(u);

		const cosV = Math.cos(v);
		const sinV = Math.sin(v);

		const cosUcosU = cosU * cosU;
		const sinUsinU = sinU * sinU;

		const x =
			(radius * cosU * cosV) /
			Math.sqrt(1 - squareness * (cosUcosU * sinV * sinV + sinUsinU));

		const y =
			(radius * cosU * sinV) /
			Math.sqrt(1 - squareness * (cosUcosU * cosV * cosV + sinUsinU));

		const z = (radius * sinU) / Math.sqrt(1 - squareness * cosUcosU);

		target.set(x, y, z);
	};
};
