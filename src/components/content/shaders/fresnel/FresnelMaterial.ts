import fragmentShader from "./fragment.glsl?raw";
import vertexShader from "./vertex.glsl?raw";

import { Color, ShaderMaterial, Uniform } from "three";

type Uniforms = {
	uBaseColor: Uniform<Color>;
	uFresnelColor: Uniform<Color>;
	uPower: Uniform<number>;
};

export const createUniforms = (): Uniforms => {
	return {
		uBaseColor: new Uniform(new Color()),
		uFresnelColor: new Uniform(new Color("white")),
		uPower: new Uniform(1),
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
