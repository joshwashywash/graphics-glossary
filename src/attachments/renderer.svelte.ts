import type { Attachment } from "svelte/attachments";
import { WebGLRenderer } from "three";

export type Setup = (renderer: WebGLRenderer) => () => void;

/**
 * @param setup a function that will be called with the created renderer. it may return a 'cleanup' function that will be called when the canvas is removed
 */
const renderer = (setup: Setup): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		const cleanup = setup(renderer);

		return () => {
			cleanup();
			renderer.dispose();
		};
	};
};

export default renderer;
