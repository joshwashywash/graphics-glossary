import type { Attachment } from "svelte/attachments";
import { devicePixelRatio } from "svelte/reactivity/window";
import { WebGLRenderer } from "three";

export type WithRenderer = (renderer: WebGLRenderer) => (() => void) | void;

export const renderer = (
	getWidth: () => number,
	getHeight: () => number,
	withRenderer?: WithRenderer,
): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setPixelRatio(devicePixelRatio.current ?? 1);
		});

		$effect(() => {
			renderer.setSize(getWidth(), getHeight());
		});

		$effect(() => {
			return withRenderer?.(renderer);
		});

		return renderer.dispose;
	};
};
