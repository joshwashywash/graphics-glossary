import fragmentShader from "./fragment.glsl?raw";
import vertexShader from "./vertex.glsl?raw";

import { Color, ShaderMaterial, Uniform } from "three";

type Uniforms = {
	uBaseColor: Uniform<Color>;
	uFresnelColor: Uniform<Color>;
	uPower: Uniform<number>;
};

export const powerConstraints = {
	min: 0,
	max: 3,
	step: 0.5,
};

export const createUniforms = (): Uniforms => {
	return {
		uBaseColor: new Uniform(new Color("#583558")),
		uFresnelColor: new Uniform(new Color("#ccccaa")),
		uPower: new Uniform(0.5 * (powerConstraints.max - powerConstraints.min)),
	};
};

export class FresnelMaterial extends ShaderMaterial {
	constructor(uniforms = createUniforms()) {
		super({
			fragmentShader,
			uniforms,
			vertexShader,
		});
	}
}
