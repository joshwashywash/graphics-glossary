varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 toCamera = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - 0.5 * ((dot(toCamera, vNormal) + 1.0));
    gl_FragColor = vec4(fresnel, fresnel, fresnel, 1.0);
}
