export const loadImage = (src: string, width?: number, height?: number) => {
	return new Promise<HTMLImageElement>((resolve) => {
		const image = new Image(width, height);
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
