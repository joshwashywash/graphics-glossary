import { FresnelMaterial, createUniforms } from "./FresnelMaterial";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import {
	Mesh,
	PerspectiveCamera,
	Scene,
	TorusGeometry,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Getters = {
	getAspect: () => number;
	getAutoRotate: () => boolean;
	getCanvasHeight: () => number;
	getCanvasWidth: () => number;
	getPixelRatio: () => number;
	getPower: () => number;
	getBaseColor: () => string;
	getFresnelColor: () => string;
};

export const createAttachment = ({
	getAspect,
	getPower,
	getBaseColor,
	getFresnelColor,
	getAutoRotate,
	getCanvasHeight,
	getCanvasWidth,
	getPixelRatio,
}: Getters): Attachment<HTMLCanvasElement> => {
	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 4);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const geometry = new TorusGeometry();

	const uniforms = createUniforms();
	const material = new FresnelMaterial(uniforms);

	const mesh = new Mesh(geometry, material);
	const scene = new Scene().add(mesh);

	const controls = new OrbitControls(camera);

	return (canvas) => {
		$effect(() => {
			updateCameraAspect(getAspect());
			render();
		});

		$effect(() => {
			uniforms.uBaseColor.value.set(getBaseColor());
			render();
		});

		$effect(() => {
			uniforms.uFresnelColor.value.set(getFresnelColor());
			render();
		});

		$effect(() => {
			uniforms.uPower.value = getPower();
			render();
		});

		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setSize(getCanvasWidth(), getCanvasHeight());
			render();
		});

		$effect(() => {
			renderer.setPixelRatio(getPixelRatio());
			render();
		});

		controls.connect(renderer.domElement);

		const render = () => {
			renderer.render(scene, camera);
		};

		controls.addEventListener("change", render);

		$effect(() => {
			controls.autoRotate = getAutoRotate();
			if (controls.autoRotate) {
				renderer.setAnimationLoop(() => {
					controls.update();
				});
				return () => {
					renderer.setAnimationLoop(null);
				};
			}
		});

		return () => {
			controls.removeEventListener("change", render);
			controls.disconnect();
			renderer.dispose();
		};
	};
};
