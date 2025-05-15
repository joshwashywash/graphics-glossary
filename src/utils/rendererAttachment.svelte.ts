import type { Attachment } from "svelte/attachments";
import { WebGLRenderer } from "three";

export type Init = (renderer: WebGLRenderer) => () => void;

const renderer = (init: Init): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		const width = renderer.domElement.parentElement?.clientWidth ?? 1;
		renderer.setSize(width, width);

		const cleanup = init(renderer);

		return () => {
			cleanup();
			renderer.dispose();
		};
	};
};

export default renderer;
