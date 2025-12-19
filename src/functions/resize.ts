import { updateCameraAspect } from "./updateCameraAspect";

import type { Size } from "@classes/size.svelte";

import type { PerspectiveCamera, Renderer } from "three/webgpu";

export const resize = (
	renderer: Renderer,
	camera: PerspectiveCamera,
	size: Size,
) => {
	renderer.setSize(size.width, size.height, false);

	const aspect = size.width / size.height;
	updateCameraAspect(camera, aspect);
};
