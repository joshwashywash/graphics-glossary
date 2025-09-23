import fragmentShader from "./fragment.glsl?raw";
import vertexShader from "./vertex.glsl?raw";

import { Color, ShaderMaterial, Uniform } from "three";

export type Uniforms = {
	uBaseColor: Uniform<Color>;
	uFresnelColor: Uniform<Color>;
	uPower: Uniform<number>;
};

export const powerParams = {
	min: 0,
	max: 3,
	step: 0.5,
	label: "power",
};

export const createUniforms = ({
	initialBaseColor = "#583583",
	initialFresnelColor = "#ccccaa",
	initialPower = 0.5 * (powerParams.max - powerParams.min),
} = {}): Uniforms => {
	return {
		uBaseColor: new Uniform(new Color(initialBaseColor)),
		uFresnelColor: new Uniform(new Color(initialFresnelColor)),
		uPower: new Uniform(initialPower),
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
