import type { Size } from "@classes/size.svelte";

import type { Renderer } from "three/webgpu";

/**
 * uses an $effect to resize the renderer when `size.width` or `size.height` updates
 */
export const useResizeRenderer = (getRenderer: () => Renderer, size: Size) => {
	$effect(() => {
		getRenderer().setSize(size.width, size.height, false);
	});
};
