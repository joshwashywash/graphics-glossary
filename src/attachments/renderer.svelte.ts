import type { Attachment } from "svelte/attachments";
import { WebGLRenderer } from "three";

export type WithRenderer = (renderer: WebGLRenderer) => (() => void) | void;

/**
 * a canvas attachment that creates a webgl renderer
 *
 * the renderer is disposed when the attachment reruns and after the canvas is removed from the dom
 *
 * @param withRenderer a function that receives the created renderer. it is ran in a child effect so it may return a cleanup function
 */
export const renderer = (
	withRenderer: WithRenderer,
): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			return withRenderer(renderer);
		});

		return renderer.dispose;
	};
};
