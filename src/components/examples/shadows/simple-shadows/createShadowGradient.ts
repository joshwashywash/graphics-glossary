export const createShadowGradient = (
	context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
	backgroundColor = "rgba(0,0,0,0)",
	shadowColor = "black",
) => {
	const canvasHalfSize = 0.5 * context.canvas.width;

	const gradient = context.createRadialGradient(
		canvasHalfSize,
		canvasHalfSize,
		0,
		canvasHalfSize,
		canvasHalfSize,
		canvasHalfSize,
	);

	gradient.addColorStop(0, shadowColor);
	gradient.addColorStop(1, backgroundColor);

	return gradient;
};
