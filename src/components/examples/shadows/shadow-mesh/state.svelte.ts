import type { WebGLRendererParameters } from "three";

export class State {
	canvasWidth = $state(1);
	aspect = $state(4 / 3);
	canvasHeight = $derived(this.canvasWidth / this.aspect);

	rendererParameters = $state.raw<WebGLRendererParameters>({
		antialias: true,
		stencil: true,
	});
}
