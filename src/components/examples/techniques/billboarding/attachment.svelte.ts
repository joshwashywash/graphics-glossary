import type { State } from "./state.svelte";

import booImageMetadata from "@assets/boo.png";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";
import { loadImage } from "@functions/loadImage";

import type { Attachment } from "svelte/attachments";
import { devicePixelRatio } from "svelte/reactivity/window";
import {
	BoxGeometry,
	CanvasTexture,
	Mesh,
	MeshNormalMaterial,
	NearestFilter,
	PerspectiveCamera,
	RepeatWrapping,
	Scene,
	Sprite,
	SpriteMaterial,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const tau = 2 * Math.PI;

const forwardsFrameCount = 18;

/**
 * number of frames to show during the last half of the rotation
 * equal to `frameCount` minus the first and last *frames*
 */
const backwardsFrameCount = forwardsFrameCount - 2;

const frameCount = forwardsFrameCount + backwardsFrameCount;

const spriteWidth = booImageMetadata.width / forwardsFrameCount;

/** the width of the image minus the width of the first and last sprites */
const extensionWidth = booImageMetadata.width - 2 * spriteWidth;

export const createBillboarding = (
	state: State,
): { attachment: Attachment; dispose(): void } => {
	let lastOffset: number;

	return {
		attachment(canvas) {
			const renderer = new WebGLRenderer({
				canvas,
				...state.rendererParameters,
			});

			$effect(() => {
				updateCameraAspect(state.aspect);
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(state.canvasWidth, state.canvasHeight);
			});

			$effect(() => {
				renderer.setPixelRatio(devicePixelRatio.current ?? 1);
			});

			$effect(() => {
				controls.autoRotate = state.useAutoRotate;
			});

			controls.addEventListener("change", render);
			controls.connect(renderer.domElement);

			return () => {
				controls.removeEventListener("change", render);
				controls.disconnect();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		},
	};
};
