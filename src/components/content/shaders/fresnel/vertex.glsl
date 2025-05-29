varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // `normal`, `position`, etc. are all available through THREE.ShaderMaterial
    vNormal = normal;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
