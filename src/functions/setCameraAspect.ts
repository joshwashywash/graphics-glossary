import type { PerspectiveCamera } from "three";

export const setCameraAspect = (
	camera: PerspectiveCamera,
	aspect: PerspectiveCamera["aspect"],
) => {
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
};
