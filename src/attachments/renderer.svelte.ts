import type { Attachment } from "svelte/attachments";
import { WebGLRenderer } from "three";

export type Setup = (renderer: WebGLRenderer) => (() => void) | void;

/**
 * @param getWidth a getter for the width of the renderer.
 *
 * @param getWidth a getter for the height of the renderer.
 *
 * @param setup a function that will be called with the created renderer.
 * it may return a *cleanup* function that will be called when the canvas is removed
 *
 * after the renderer is created, a *set size* child effect is ran to set the size of the renderer. this effect will update the css styles of the renderer's canvas.
 *
 * note that the *setup* and *setSize* effects are ran in **different** child effects
 */
export const renderer = (
	getWidth: () => number,
	getHeight: () => number,
	setup?: Setup,
): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setSize(getWidth(), getHeight());
		});

		$effect(() => {
			return setup?.(renderer);
		});

		return renderer.dispose;
	};
};
