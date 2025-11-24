import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const onOrbitControls = (
	controls: OrbitControls,
	...params: Parameters<OrbitControls["addEventListener"]>
) => {
	controls.addEventListener(...params);
	return () => {
		controls.removeEventListener(...params);
	};
};
