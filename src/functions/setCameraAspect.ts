import { PerspectiveCamera } from "three/webgpu";

export const setCameraAspect = (
	camera: PerspectiveCamera,
	aspect: PerspectiveCamera["aspect"],
) => {
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
};
