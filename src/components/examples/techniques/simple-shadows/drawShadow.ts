export const drawShadow = (context: OffscreenCanvasRenderingContext2D) => {
	const textureCanvasHalfSize = 0.5 * context.canvas.width;
	const gradient = context.createRadialGradient(
		textureCanvasHalfSize,
		textureCanvasHalfSize,
		0,
		textureCanvasHalfSize,
		textureCanvasHalfSize,
		textureCanvasHalfSize,
	);
	gradient.addColorStop(0, "black");
	gradient.addColorStop(1, "rgba(0,0,0,0)");
	context.fillStyle = gradient;
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);
};
