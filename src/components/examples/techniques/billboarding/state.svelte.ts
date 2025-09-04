import type { WebGLRendererParameters } from "three";

export class State {
	aspect = $state(4 / 3);
	canvasWidth = $state(1);
	canvasHeight = $derived(this.canvasWidth / this.aspect);

	useAutoRotate = $state(true);

	rendererParameters = $state.raw<WebGLRendererParameters>({
		antialias: true,
	});
}
