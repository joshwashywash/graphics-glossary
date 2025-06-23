import fragmentShader from "./fragment.glsl?raw";
import vertexShader from "./vertex.glsl?raw";

import { Color, Mesh, ShaderMaterial, TorusGeometry, Uniform } from "three";

export const createMesh = () => {
	const geometry = new TorusGeometry();

	const uniforms = {
		uBaseColor: new Uniform(new Color()),
		uFresnelColor: new Uniform(new Color()),
		uPower: new Uniform(1),
	};

	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
		uniforms,
	});

	const dispose = () => {
		geometry.dispose();
		material.dispose();
	};

	const mesh = new Mesh(geometry, material);

	return {
		dispose,
		mesh,
		uniforms,
	};
};
