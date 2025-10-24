import type { PerspectiveCamera } from "three";

export const updateCameraAspect = (
	camera: PerspectiveCamera,
	aspect: PerspectiveCamera["aspect"],
) => {
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
};
