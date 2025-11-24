uniform sampler2D uScene;
uniform vec2 uResolution;

varying vec2 vUv;

const mat4x4 bayer4x4 = mat4x4(
	0.0,  8.0,  2.0, 10.0,
	12.0, 4.0,  14.0, 6.0,
	3.0,  11.0, 1.0, 9.0,
	15.0, 7.0,  13.0, 5.0
) / 16.0;

vec3 dither(vec2 uv, vec2 resolution, float lum) {
	int x = int(uv.x * resolution.x) % 4;
	int y = int(uv.y * resolution.y) % 4;

	float threshold = bayer4x4[y][x];

	return vec3(float(lum < threshold));
}

void main() {
	float lum = dot(
			vec4(0.2126, 0.7152, 0.0722, 0.0),
			texture2D(uScene, vUv)
	);

	gl_FragColor = vec4(dither(vUv, uResolution, lum), 1.0);
}
