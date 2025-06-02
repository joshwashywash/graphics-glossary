varying vec3 vWorldNormal;
varying vec3 vViewDirection;

void main() {
    // dot product's range is -1 to 1. remap to 0 -> 1 then invert so that the edges are white
    float fresnel = 1.0 - 0.5 * (1.0 + (dot(vWorldNormal, vViewDirection)));
    gl_FragColor = vec4(fresnel, fresnel, fresnel, 1.0);
}
