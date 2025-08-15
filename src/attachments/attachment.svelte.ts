import type { Attachment } from "svelte/attachments";
import { WebGLRenderer } from "three";

export type WithRenderer = (renderer: WebGLRenderer) => (() => void) | void;

export const attachment = (
	withRenderer: WithRenderer,
): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			const cleanup = withRenderer(renderer);
			return cleanup;
		});

		return () => {
			renderer.dispose();
		};
	};
};
