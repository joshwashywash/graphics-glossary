attribute vec3 position;

varying vec2 vUv;

void main() {
	vUv = 0.5 * (position.xy + 1.0);
	gl_Position = vec4(position, 1.0);
}

