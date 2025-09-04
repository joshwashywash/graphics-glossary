import type { Attachment } from "svelte/attachments";
import { devicePixelRatio } from "svelte/reactivity/window";
import type { WebGLRendererParameters } from "three";
import { WebGLRenderer } from "three";

export class State {
	canvasWidth = $state(1);
	aspect = $state(1);
	canvasHeight = $derived(this.canvasWidth / this.aspect);
	rendererParameters = $state.raw<WebGLRendererParameters>({ antialias: true });
	withRenderer = $state<
		null | ((renderer: WebGLRenderer) => (() => void) | void)
	>(null);
}

export const createRendererAttachment = (
	state: State,
): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const renderer = new WebGLRenderer({
			canvas,
			...state.rendererParameters,
		});

		$effect(() => {
			const cleanup = state.withRenderer?.(renderer);
			return cleanup;
		});

		$effect(() => {
			renderer.setSize(state.canvasWidth, state.canvasHeight);
		});

		$effect(() => {
			renderer.setPixelRatio(devicePixelRatio.current ?? 1);
		});

		return () => {
			renderer.dispose();
		};
	};
};
