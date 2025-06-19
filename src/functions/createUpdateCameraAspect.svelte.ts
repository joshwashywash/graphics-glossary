import { PerspectiveCamera } from "three";

export const createUpdateCameraAspect = (camera: PerspectiveCamera) => {
	return (aspect: number) => {
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
	};
};
