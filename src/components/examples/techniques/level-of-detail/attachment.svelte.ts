import type { LodLevel } from "./types";

import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

import type { Attachment } from "svelte/attachments";
import {
	BufferGeometry,
	IcosahedronGeometry,
	LOD,
	Mesh,
	MeshNormalMaterial,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from "three";

type Getters = {
	getAspect: () => number;
	getCanvasWidth: () => number;
	getCanvasHeight: () => number;
};

export const createAttachment = ({
	getAspect,
	getCanvasHeight,
	getCanvasWidth,
}: Getters): Attachment<HTMLCanvasElement> => {
	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);

	const z = 5;
	const offset = 3;
	const distances = [z - offset, offset, z + offset];

	const levels: LodLevel[] = [];
	const material = new MeshNormalMaterial({
		wireframe: true,
	});

	const geometries: BufferGeometry[] = [];

	for (let i = 0, l = distances.length; i < l; i += 1) {
		const detail = l - i - 1;
		const geometry = new IcosahedronGeometry(1, detail);
		geometries.push(geometry);
		const object = new Mesh(geometry, material);
		const distance = distances[i];
		levels.push({
			object,
			distance,
		});
	}

	const lod = levels.reduce((lod, { distance, hysteresis, object }) => {
		return lod.addLevel(object, distance, hysteresis);
	}, new LOD());

	const scene = new Scene().add(lod);

	const disposeScene = () => {
		scene.remove(lod);

		for (const distance of distances) {
			lod.removeLevel(distance);
		}

		for (const geometry of geometries) {
			geometry.dispose();
		}

		material.dispose();
	};

	return (canvas) => {
		$effect(() => {
			updateCameraAspect(getAspect());
		});

		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setSize(getCanvasWidth(), getCanvasHeight());
			// no need to render since rendering is done in an animation loop
		});

		renderer.setAnimationLoop((time) => {
			renderer.render(scene, camera);

			time *= 1 / 1000;
			camera.position.setZ(1 + z + 1.5 * offset * Math.sin(0.75 * time));
		});

		return () => {
			disposeScene();
			renderer.setAnimationLoop(null);
			renderer.dispose();
		};
	};
};
