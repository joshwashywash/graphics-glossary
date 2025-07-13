/**
 * asynchronously loads an image
 */
export const loadImage = (
	src: string,
	width?: number,
	height?: number,
): Promise<HTMLImageElement> => {
	const image = new Image(width, height);
	return new Promise((resolve) => {
		image.addEventListener(
			"load",
			() => {
				resolve(image);
			},
			{
				once: true,
			},
		);
		image.src = src;
	});
};
