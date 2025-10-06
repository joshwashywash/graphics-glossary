import { BufferAttribute, BufferGeometry, Sphere, Vector3 } from "three";

export class ScreenQuadGeometry extends BufferGeometry {
	static #center = new Vector3();
	static #vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
	constructor() {
		super();

		this.setAttribute(
			"position",
			new BufferAttribute(ScreenQuadGeometry.#vertices, 2),
		);

		this.boundingSphere = new Sphere().set(
			ScreenQuadGeometry.#center,
			Infinity,
		);
	}
}
