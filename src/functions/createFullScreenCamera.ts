import { OrthographicCamera } from "three/webgpu";

export const createFullScreenCamera = () => {
	return new OrthographicCamera(-1, 1, 1, -1, 0, 1);
};
