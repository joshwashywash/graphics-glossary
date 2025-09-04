import type { State } from "./state.svelte";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import { devicePixelRatio } from "svelte/reactivity/window";
import {
	Mesh,
	MeshNormalMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const createFlatShading = (
	state: State,
): {
	attachment: Attachment<HTMLCanvasElement>;
	dispose(): void;
} => {
	const camera = new PerspectiveCamera();
	camera.translateZ(3);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const controls = new OrbitControls(camera);

	const mesh = new Mesh(new SphereGeometry(1, 16, 8), new MeshNormalMaterial());

	const scene = new Scene().add(mesh);

	let loop: null | (() => void) = null;
	const isLooping = () => loop !== null;

	return {
		attachment(canvas) {
			const renderer = new WebGLRenderer({
				canvas,
				...state.rendererParameters,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				if ((controls.autoRotate = state.autoRotateCamera)) {
					renderer.setAnimationLoop(
						(loop = () => {
							controls.update();
							render();
						}),
					);

					return () => {
						renderer.setAnimationLoop((loop = null));
					};
				}

				controls.addEventListener("change", render);
				return () => {
					controls.removeEventListener("change", render);
				};
			});

			$effect(() => {
				updateCameraAspect(state.aspect);
				if (!isLooping()) render();
			});

			$effect(() => {
				renderer.setSize(state.canvasWidth, state.canvasHeight);
				if (!isLooping()) render();
			});

			$effect(() => {
				renderer.setPixelRatio(devicePixelRatio.current ?? 1);
				if (!isLooping()) render();
			});

			$effect(() => {
				mesh.material.flatShading = state.useFlatShading;
				mesh.material.needsUpdate = true;
				if (!isLooping()) render();
			});

			controls.connect(renderer.domElement);

			return () => {
				controls.disconnect();
				renderer.dispose();
			};
		},
		dispose() {
			scene.remove(mesh);
			mesh.geometry.dispose();
			mesh.material.dispose();
		},
	};
};
