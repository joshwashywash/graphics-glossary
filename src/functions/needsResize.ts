/**
 * returns true if the canvas's display dimensions differ from its own dimensions
 * useful to know if a renderer needs to be resized
 *
 * @example
 *
 * ```ts
 * const canvas = renderer.domElement;
 *
 * renderer.setAnimationLoop((renderer) => {
 *   if (needsResize(canvas)) {
 *     const { clientWidth, clientHeight } = canvas;
 *     renderer.setSize(clientWidth, clientHeight, false);
 *     // potentially other things like setting a camera's aspect or rendering the scene
 *   }
 * });
 * ```
 */
export const needsResize = (canvas: HTMLCanvasElement): boolean => {
	return (
		canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight
	);
};
