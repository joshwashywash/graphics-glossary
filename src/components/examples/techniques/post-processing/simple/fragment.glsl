precision highp float;

uniform float uAlpha;
uniform vec3 uColor;
uniform sampler2D uScene;

varying vec2 vUv;

void main() {
	vec3 color = mix(texture2D(uScene, vUv).xyz, uColor, uAlpha);
	gl_FragColor = vec4(color, 1.0);
}
