import { useDisposable } from "./useDisposable.svelte";

import { devicePixelRatio } from "svelte/reactivity/window";
import type { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";
import { WebGPURenderer } from "three/webgpu";

/**
 * creates an automatically-disposed webgpu renderer.
 *
 * resizes the renderer whenever `canvasSize.width` or `canvasSize.height` updates
 *
 * sets the pixel ratio to match the device's
 */
export const createRenderer = (
	params: WebGPURendererParameters,
	width: () => number,
	height: () => number,
) => {
	const renderer = useDisposable(WebGPURenderer, params);

	$effect(() => {
		renderer.setSize(width(), height(), false);
	});

	$effect(() => {
		renderer.setPixelRatio(devicePixelRatio.current);
	});

	return renderer;
};
