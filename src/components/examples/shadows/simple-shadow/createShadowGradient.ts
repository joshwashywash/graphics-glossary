export const createShadowGradient = (
	context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
	shadowColor = "black",
	backgroundColor = "rgba(0,0,0,0)",
) => {
	const canvasHalfWidth = 0.5 * context.canvas.width;
	const canvasHalfHeight = 0.5 * context.canvas.height;

	const radius = Math.min(canvasHalfHeight, canvasHalfHeight);

	const gradient = context.createRadialGradient(
		canvasHalfWidth,
		canvasHalfHeight,
		0,
		canvasHalfWidth,
		canvasHalfHeight,
		radius,
	);

	gradient.addColorStop(0, shadowColor);
	gradient.addColorStop(1, backgroundColor);

	return gradient;
};
