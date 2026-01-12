import { devicePixelRatio } from "svelte/reactivity/window";
import type { Renderer } from "three/webgpu";

export const setPixelRatio = (getRenderer: () => Renderer) => {
	$effect(() => {
		getRenderer().setPixelRatio(devicePixelRatio.current);
	});
};
