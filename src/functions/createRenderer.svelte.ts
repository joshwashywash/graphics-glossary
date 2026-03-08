import { useCleanup } from "./useCleanup.svelte";

import { devicePixelRatio } from "svelte/reactivity/window";
import type { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";
import { WebGPURenderer } from "three/webgpu";

/**
 * creates an automatically-disposed webgpu renderer that is automatically resized whenever `width` or `height` updates and automatically sets its pixel ratio to match the device's
 *
 */
export const createRenderer = (
	params: WebGPURendererParameters,
	width: () => number,
	height: () => number,
) => {
	const renderer = new WebGPURenderer(params);

	$effect(() => {
		renderer.setSize(width(), height(), false);
	});

	$effect(() => {
		renderer.setPixelRatio(devicePixelRatio.current);
	});

	// `setAnimationLoop` waits for renderer.init()
	useCleanup(() => {
		renderer.setAnimationLoop(null).then(() => {
			renderer.dispose();
		});
	});

	return renderer;
};
