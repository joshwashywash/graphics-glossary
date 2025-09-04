import type { WebGLRendererParameters } from "three";

export class State {
	aspect = $state(4 / 3);
	useAutoRotate = $state(true);

	canvasWidth = $state(1);
	canvasHeight = $derived(this.canvasWidth / this.aspect);

	rendererParameters = $state.raw<WebGLRendererParameters>({
		antialias: true,
	});
}
