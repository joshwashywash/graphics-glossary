import createColorAttribute from "./createColorAttribute";

import { BoxGeometry } from "three";

// the default box geometry positions range from -0.5 -> 0.5
// `f` remaps this to 0 -> 1
const f = (n: number): number => 0.5 + n;

const map = {
	x: f,
	y: f,
	z: f,
};

export class VertexColorsBoxGeometry extends BoxGeometry {
	constructor() {
		super();
		const positionAttribute = this.getAttribute("position");
		const colorAttribute = createColorAttribute(positionAttribute, map);
		this.setAttribute("color", colorAttribute);
	}
}
