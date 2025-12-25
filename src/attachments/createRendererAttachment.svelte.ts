import type { Attachment } from "svelte/attachments";
import type { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";
import { WebGPURenderer } from "three/webgpu";

export const createRendererAttachment = (
	f: (renderer: WebGPURenderer) => (() => void) | void,
	parameters: WebGPURendererParameters = { antialias: true },
): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		const promise = new WebGPURenderer({
			canvas,
			...parameters,
		})
			.init()
			.then((renderer) => {
				return $effect.root(() => {
					const cleanup = f(renderer);
					return () => {
						cleanup?.();
						renderer.dispose();
					};
				});
			});

		return () => {
			promise.then((cleanup) => cleanup());
		};
	};
};
