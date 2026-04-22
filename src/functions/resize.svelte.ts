import type { Renderer } from "three/webgpu";

export const resize = (renderer: Renderer) => {
	const dpr = window.devicePixelRatio;
	const canvas = renderer.domElement;
	const width = Math.floor(canvas.clientWidth * dpr);
	const height = Math.floor(canvas.clientHeight * dpr);
	const resized = canvas.width !== width || canvas.height !== height;
	if (resized) renderer.setSize(width, height, false);
	return resized;
};
