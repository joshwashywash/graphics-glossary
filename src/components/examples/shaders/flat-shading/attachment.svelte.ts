import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import {
	Mesh,
	MeshNormalMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Getters = {
	getAutoRotate: () => boolean;
	getCanvasHeight: () => number;
	getCanvasWidth: () => number;
	getAspect: () => number;
	getFlatShading: () => boolean;
	getPixelRatio: () => number;
};

export const createAttachment = ({
	getAspect,
	getAutoRotate,
	getCanvasHeight,
	getCanvasWidth,
	getFlatShading,
	getPixelRatio,
}: Getters): Attachment<HTMLCanvasElement> => {
	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);
	camera.position.set(0, 0, 3);
	const controls = new OrbitControls(camera);

	const material = new MeshNormalMaterial();
	const geometry = new SphereGeometry(1, 16, 8);

	const mesh = new Mesh(geometry, material);
	const scene = new Scene().add(mesh);

	let loop: (() => void) | null = null;
	const loopIsNull = () => loop === null;

	return (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		const render = () => {
			renderer.render(scene, camera);
		};

		$effect(() => {
			updateCameraAspect(getAspect());
			if (loopIsNull()) {
				render();
			}
		});

		$effect(() => {
			renderer.setSize(getCanvasWidth(), getCanvasHeight());
			if (loopIsNull()) {
				render();
			}
		});

		$effect(() => {
			renderer.setPixelRatio(getPixelRatio());
			if (loopIsNull()) {
				render();
			}
		});

		$effect(() => {
			material.flatShading = getFlatShading();
			material.needsUpdate = true;
			if (loopIsNull()) {
				render();
			}
		});

		controls.addEventListener("change", render);

		controls.connect(renderer.domElement);

		$effect(() => {
			controls.autoRotate = getAutoRotate();
			if (controls.autoRotate) {
				renderer.setAnimationLoop(
					(loop = () => {
						controls.update();
					}),
				);
				return () => {
					renderer.setAnimationLoop((loop = null));
				};
			}
		});

		return () => {
			controls.removeEventListener("change", render);
			controls.disconnect();
			scene.remove(mesh);
			material.dispose();
			geometry.dispose();
			renderer.dispose();
		};
	};
};
