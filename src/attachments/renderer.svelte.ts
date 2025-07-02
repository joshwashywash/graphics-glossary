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
 * @param getWithRenderer an optional function that is called "with" the created renderer
 * it is called in an effect so if it is a $state(), it will be recalled when it updates. like an effect, it may return a "cleanup" function that will be called if the renderer updates
 * commonly used to set the renderer's animation loop
 *
 * @example
 *
 * ```ts
 * const width = $state(400);
 * const height = $state(400);
 *
 * const withRenderer = (renderer) => {
 *   renderer.setAnimationLoop(() => {
 *     // ...
 *   });
 *
 *   return () => {
 *     renderer.setAnimationLoop(null);
 *   };
 * }
 *
 * <canvas
 *   {@attach renderer(
 *     () => width,
 *     () => height,
 *     () => withRenderer
 *   )}
 * >
 * </canvas>
 * ```
 */
export const renderer = (
	getWidth: () => number,
	getHeight: () => number,
	getWithRenderer?: () => WithRenderer,
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
			const withRenderer = getWithRenderer?.();
			const cleanup = withRenderer?.(renderer);
			return cleanup;
		});

		return renderer.dispose;
	};
};
