import type { Attachment } from "svelte/attachments";
import { devicePixelRatio } from "svelte/reactivity/window";
import { WebGLRenderer } from "three";

export type WithRenderer = (renderer: WebGLRenderer) => (() => void) | void;

/**
 * a canvas attachment that creates a webgl renderer.
 *
 * the renderer's size is set in an effect by calling `getWidth` and `getHeight`
 *
 * the renderer's pixel ratio is set in an effect according to svelte's `devicePixelRatio` from 'svelte/reactivity'
 *
 * the renderer is disposed when the attachment re-runs and after the canvas is removed from the dom
 *
 * @param withRenderer a optional function that is called "with" the created renderer
 * it is ran in an effect. like an effect, it may return a "cleanup" function that will be called if the renderer updates
 * a common use case is to set the renderer's animation loop
 *
 * @example
 *
 * ```ts
 * const camera = new PerspectiveCamera();
 * const scene = new Scene();
 *
 * const withRenderer = (renderer) => {
 *   renderer.setAnimationLoop(() => {
 *     renderer.render(scene, camera);
 *   });
 *
 *   return () => {
 *     renderer.setAnimationLoop(null);
 *   };
 * }
 * ```
 */
export const renderer = (
	getWidth: () => number,
	getHeight: () => number,
	withRenderer?: WithRenderer,
): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setPixelRatio(devicePixelRatio.current ?? 1);
		});

		$effect(() => {
			renderer.setSize(getWidth(), getHeight());
		});

		$effect(() => {
			return withRenderer?.(renderer);
		});

		return renderer.dispose;
	};
};
