import fragmentShader from "./fragment.glsl?raw";
import vertexShader from "./vertex.glsl?raw";

import {
	Color,
	Mesh,
	Scene,
	ShaderMaterial,
	TorusGeometry,
	Uniform,
} from "three";

export const createScene = () => {
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
		uniforms,
	};
};
