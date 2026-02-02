import { useDisposable } from "./useDisposable.svelte";

import { devicePixelRatio } from "svelte/reactivity/window";
import type { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";
import { WebGPURenderer } from "three/webgpu";

/**
 * creates a webgpu renderer that automatically sets its pixel ratio to match the device's.
 *
 * the created renderer is automatically disposed when the parent effect is destroyed
 */
export const createRenderer = (params: WebGPURendererParameters) => {
	const renderer = useDisposable(WebGPURenderer, params);

	$effect(() => {
		renderer.setPixelRatio(devicePixelRatio.current);
	});

	return renderer;
};
