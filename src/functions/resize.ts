import type { Renderer } from "three/webgpu";

export const resize = (renderer: Renderer) => {
	const canvas = renderer.domElement;
	const dpr = window.devicePixelRatio;
	const width = Math.floor(canvas.clientWidth * dpr);
	const height = Math.floor(canvas.clientHeight * dpr);
	const needsResize = canvas.width !== width || canvas.height !== height;
	if (needsResize) renderer.setSize(width, height, false);
	return needsResize;
};
