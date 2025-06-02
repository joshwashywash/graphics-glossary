varying vec3 vWorldNormal;
varying vec3 vViewDirection;

void main() {
    vWorldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
