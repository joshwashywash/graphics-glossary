import { FresnelMaterial, createUniforms } from "./FresnelMaterial";
import type { State } from "./state.svelte";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import { devicePixelRatio } from "svelte/reactivity/window";
import {
	Mesh,
	PerspectiveCamera,
	Scene,
	TorusGeometry,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const createFresnel = (
	state: State,
): {
	attachment: Attachment<HTMLCanvasElement>;
	dispose(): void;
} => {
	const geometry = new TorusGeometry();

	const uniforms = createUniforms();
	const material = new FresnelMaterial(uniforms);
	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	let loop: null | (() => void) = null;

	const isLooping = () => loop !== null;

	const camera = new PerspectiveCamera();
	camera.translateZ(4);

	const updateCameraAspect = createUpdateCameraAspect(camera);

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
				updateCameraAspect(state.aspect);
				if (!isLooping()) render;
			});

			$effect(() => {
				uniforms.uBaseColor.value.set(state.baseColor);
				if (!isLooping()) render();
			});

			$effect(() => {
				uniforms.uFresnelColor.value.set(state.fresnelColor);
				if (!isLooping()) render();
			});

			$effect(() => {
				uniforms.uPower.value = state.power;
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
				if ((controls.autoRotate = state.useAutoRotate)) {
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

			controls.connect(renderer.domElement);

			return () => {
				controls.disconnect();
				renderer.dispose();
			};
		},
		dispose() {
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();
		},
	};
};
