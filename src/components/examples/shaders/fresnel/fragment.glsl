uniform float uPower;
uniform vec3 uFresnelColor;
uniform vec3 uBaseColor;

varying vec3 vWorldNormal;
varying vec3 vViewDirection;

void main() {
	float f = 0.5 * (1.0 + dot(vWorldNormal, vViewDirection));
	float fresnel = pow(f, uPower);
	float inverseFresnel = pow(1.0 - f, uPower);

	gl_FragColor = vec4(fresnel * uBaseColor + inverseFresnel * uFresnelColor, 1.0);
}
