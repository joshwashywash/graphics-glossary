import { PerspectiveCamera } from "three";

/**
 * returns a `PerspectiveCamera` that when `getAspect` updates, sets the camera's updates the camera's aspect ratio in an effect.
 */
export const createAspectPerspectiveCamera = (getAspect: () => number) => {
	const camera = new PerspectiveCamera();
	$effect(() => {
		camera.aspect = getAspect();
		camera.updateProjectionMatrix();
	});
	return camera;
};
