import { createShadowGradient } from "../createShadowGradient";
import { createFloorMesh } from "./createFloorMesh";
import { createShadowMesh } from "./createShadowMesh";
import { createSphereMesh } from "./createSphereMesh";
import type { State } from "./state.svelte";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import { devicePixelRatio } from "svelte/reactivity/window";
import {
	CanvasTexture,
	Group,
	MathUtils,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	Vector3,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const createSimpleShadow = (
	state: State,
): {
	attachment: Attachment<HTMLCanvasElement>;
	dispose(): void;
} => {
	const controls = new OrbitControls(camera);

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

			$effect(() => {
				renderer.setPixelRatio(devicePixelRatio.current ?? 1);
			});

			$effect(() => {
				updateCameraAspect(state.aspect);
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			controls.connect(renderer.domElement);

			controls.addEventListener("change", render);

			return () => {
				controls.removeEventListener("change", render);
				controls.disconnect();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		},
		dispose() {
			for (const child of scene.children) child.removeFromParent();
			for (const child of group.children) child.removeFromParent();

			disposeSphere();
			disposeFloor();
			disposeShadow();
			shadowMap.dispose();
			shadowMaterial.dispose();
		},
	};
};
