varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // `cameraPosition` is available through THREE.ShaderMaterial
    vec3 toCameraNormalized = normalize(cameraPosition - vPosition);
    // dot product's range is -1 to 1. remap to 0 -> 1 then invert so that the edges are white
    float fresnel = 1.0 - 0.5 * ((dot(toCameraNormalized, vNormal) + 1.0));
    gl_FragColor = vec4(fresnel, fresnel, fresnel, 1.0);
}
