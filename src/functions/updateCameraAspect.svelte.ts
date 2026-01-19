import type { Getters } from "../types";

import type { PerspectiveCamera } from "three";

type UpdateCameraAspectParams = {
	aspect: PerspectiveCamera["aspect"];
	camera: PerspectiveCamera;
};

export const updateCameraAspect = ({
	aspect,
	camera,
}: UpdateCameraAspectParams) => {
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
};

export const useUpdateCameraAspect = ({
	getAspect,
	getCamera,
}: Getters<UpdateCameraAspectParams>) => {
	$effect(() => {
		updateCameraAspect({
			aspect: getAspect(),
			camera: getCamera(),
		});
	});
};
