import type { Attachment } from "svelte/attachments";
import type { WebGLRendererParameters } from "three";
import { WebGLRenderer } from "three";

/**
 * a function to call with the created WebGLRenderer, it may return a clean up function
 *
 * @example
 * ```ts
 * let withRenderer = $state<WithRenderer>((renderer) => {
 *   renderer.setAnimationLoop(() => {
 *     renderer.render(scene, camera);
 *   });
 *
 *   return () => {
 *     renderer.setAnimationLoop(null);
 *   };
 * });
 * ```
 */
export type WithRenderer = (renderer: WebGLRenderer) => (() => void) | void;

/**
 * returns an attachment that creates a WebGLRenderer instance and runs the returned function of `getWithRenderer` in an effect.
 *
 * @example
 *
 * ```svelte
 * <script>
 *   const attachment = createRendererAttachment({
 *     getRendererParameters: () => { antialias: true }),
 *     getWithRenderer: () => (renderer) => {
 *       renderer.render(scene, camera);
 *     },
 *   });
 * </script>
 *
 * <canvas {@attach attachment}></canvas>
 * ```
 *
 * parameters are getters so that $states may be used, thus a new renderer is created if the renderer parameters update and the $effect will rerun if `withRenderer` updates
 *
 * @example
 *
 * ```svelte
 * <script>
 *   let rendererParameters = $state.raw({ antialias: true });
 *
 *   let withRenderer = $state((renderer) => {
 *     renderer.render(scene, camera);
 *   };
 *
 *   const attachment = createRendererAttachment({
 *     getRendererParameters: () => rendererParameters,
 *     getWithRenderer: () => withRenderer,
 *   });
 * </script>
 *
 * <canvas {@attach attachment}></canvas>
 * ```
 */
export const createRendererAttachment = ({
	getRendererParameters = () => ({}),
	getWithRenderer = () => () => {},
}: {
	getRendererParameters: () => WebGLRendererParameters;
	getWithRenderer: () => WithRenderer;
}): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const renderer = new WebGLRenderer({
			canvas,
			...getRendererParameters(),
		});

		$effect(() => {
			const cleanup = getWithRenderer()?.(renderer);
			return cleanup;
		});

		return renderer.dispose;
	};
};
