uniform float uAlpha;
uniform float uTimeMs;
uniform sampler2D uScene;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;

void main() {
	float t = 0.5 * (1.0 + sin(uTimeMs / 1000.0));

	vec3 color = mix(
		uColor1,
		uColor2,
		t
	);

	gl_FragColor = mix(
		texture2D(uScene, vUv),
		vec4(color, 1.0),
		uAlpha
	);
}
