import type { Renderer } from "three/webgpu";

/**
 * simply resizes the renderer to `width`, `height`
 */
export const resizeRenderer = (
	renderer: Renderer,
	width: number,
	height: number,
) => {
	renderer.setSize(width, height, false);
};
