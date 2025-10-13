uniform sampler2D uScene;

varying vec2 vUv;

void main() {
	vec4 color = texture2D(uScene, vUv);

	// do something interesting with the fragment

	gl_FragColor = color;
}

