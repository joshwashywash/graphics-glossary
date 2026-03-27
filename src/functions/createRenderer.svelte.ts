import { useCleanup } from "./useCleanup.svelte";

import { devicePixelRatio } from "svelte/reactivity/window";
import type { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";
import { WebGPURenderer } from "three/webgpu";

/**
 * creates an automatically-disposed webgpu renderer that sets its pixel ratio to match the device's
 */
export const createRenderer = (params: WebGPURendererParameters) => {
	const renderer = new WebGPURenderer(params);

	$effect(() => {
		renderer.setPixelRatio(devicePixelRatio.current);
	});

	useCleanup(() => {
		// `setAnimationLoop` waits for renderer.init()
		renderer.setAnimationLoop(null).then(() => {
			renderer.dispose();
		});
	});

	return renderer;
};
