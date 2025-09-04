import type { WebGLRendererParameters } from "three";

export class State {
	baseColor = $state("#000000");
	fresnelColor = $state("#ffffff");
	power = $state(1);

	aspect = $state(4 / 3);

	rendererParameters = $state.raw<WebGLRendererParameters>({ antialias: true });

	useAutoRotate = $state(true);

	canvasWidth = $state(1);
	canvasHeight = $derived(this.canvasWidth / this.aspect);
}
