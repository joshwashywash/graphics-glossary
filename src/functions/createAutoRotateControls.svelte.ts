import type { Camera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const createAutoRotateControls = (
	camera: Camera,
	getAutoRotate: () => boolean,
) => {
	const controls = new OrbitControls(camera);

	$effect(() => {
		controls.autoRotate = getAutoRotate();
	});

	return controls;
};
