precision highp float;

uniform float uAlpha;
uniform vec3 uColor;
uniform sampler2D uScene;

varying vec2 vUv;

void main() {
	vec4 color = vec4(uColor, 1.0);
	gl_FragColor = mix(texture2D(uScene, vUv), color, uAlpha);
}
