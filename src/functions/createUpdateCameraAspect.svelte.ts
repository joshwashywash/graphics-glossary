import { PerspectiveCamera } from "three";

/**
 * returns a function that sets the camera's aspect and then updates its projection matrix
 */
export const createUpdateCameraAspect = (camera: PerspectiveCamera) => {
	return (aspect: number) => {
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
	};
};
