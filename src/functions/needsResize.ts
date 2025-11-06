export const needsResize = (canvas: HTMLCanvasElement): boolean => {
	return (
		canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight
	);
};
