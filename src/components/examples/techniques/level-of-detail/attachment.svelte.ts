import { createLOD } from "./createLOD";
import type { State } from "./state.svelte";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

export const createLevelOfDetail = (
	state: State,
): { attachment: Attachment<HTMLCanvasElement>; dispose(): void } => {
	const z = 5;
	const offset = 3;
	const distances = [z - offset, offset, z + offset];

	const { lod, dispose: disposeLOD } = createLOD(distances);

	const scene = new Scene().add(lod);

	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);

	const speed = 1 / 1000;

	return {
		attachment(canvas) {
			const renderer = new WebGLRenderer({
				canvas,
				...state.rendererParameters,
			});

			$effect(() => {
				renderer.setSize(state.canvasWidth, state.canvasHeight);
			});

			renderer.setAnimationLoop((time) => {
				renderer.render(scene, camera);

				time *= speed;
				camera.position.z = 1 + z + 1.5 * offset * Math.sin(0.75 * time);
			});

			$effect(() => {
				updateCameraAspect(state.aspect);
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		},
		dispose() {
			scene.remove(lod);
			disposeLOD();
		},
	};
};
