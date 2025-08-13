import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import {
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Getters = {
	getAspect: () => number;
	getAutoRotate: () => boolean;
	getCanvasHeight: () => number;
	getCanvasWidth: () => number;
	getPixelRatio: () => number;
};

export const createAttachment = ({
	getAutoRotate,
	getAspect,
	getCanvasHeight,
	getCanvasWidth,
	getPixelRatio,
}: Getters): Attachment<HTMLCanvasElement> => {
	const geometry = new VertexColorsBoxGeometry();
	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const disposeScene = () => {
		scene.remove(mesh);
		material.dispose();
		geometry.dispose();
	};

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 3);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const controls = new OrbitControls(camera);
	return (canvas) => {
		$effect(() => {
			updateCameraAspect(getAspect());
		});

		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		const render = () => {
			renderer.render(scene, camera);
		};

		$effect(() => {
			renderer.setSize(getCanvasWidth(), getCanvasHeight());
			render();
		});

		$effect(() => {
			renderer.setPixelRatio(getPixelRatio());
			render();
		});

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

		controls.addEventListener("change", render);

		controls.connect(renderer.domElement);

		return () => {
			controls.removeEventListener("change", render);
			controls.disconnect();
			disposeScene();
			renderer.dispose();
		};
	};
};
