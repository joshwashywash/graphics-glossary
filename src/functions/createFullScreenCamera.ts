import { OrthographicCamera } from "three/webgpu";

export const createFullScreenOrthographicCamera = () => {
	return new OrthographicCamera(-1, 1, 1, -1, 0, 1);
};
