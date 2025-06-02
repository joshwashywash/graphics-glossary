import type { Attachment } from "svelte/attachments";
import { WebGLRenderer } from "three";

export type Setup = (renderer: WebGLRenderer) => (() => void) | void;

/**
 * @param setup a function that will be called with the created renderer. it may return a 'cleanup' function that will be called when the canvas is removed
 */
export default (setup?: Setup): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			return setup?.(renderer);
		});

		return renderer.dispose;
	};
};
