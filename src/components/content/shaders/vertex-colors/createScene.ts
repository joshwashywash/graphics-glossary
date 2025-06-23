import createColorAttribute from "./createColorAttribute";

import { BoxGeometry, Mesh, MeshBasicMaterial, Scene } from "three";

// the default box geometry positions range from -0.5 -> 0.5
// `f` remaps this to 0 -> 1
const f = (n: number): number => 0.5 + n;

const map = {
	x: f,
	y: f,
	z: f,
};

const createGeometry = () => {
	const geometry = new BoxGeometry();

	const positionAttribute = geometry.getAttribute("position");
	const colorAttribute = createColorAttribute(positionAttribute, map);

	geometry.setAttribute("color", colorAttribute);
	return geometry;
};

export const createScene = () => {
	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	const geometry = createGeometry();

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const dispose = () => {
		scene.remove(mesh);

		geometry.dispose();
		material.dispose();
	};

	return {
		dispose,
		scene,
	};
};
