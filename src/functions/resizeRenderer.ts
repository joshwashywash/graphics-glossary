import type { Renderer } from "three/webgpu";

export const resizeRenderer = (
	renderer: Renderer,
	width: number,
	height: number,
) => {
	renderer.setSize(width, height, false);
};
