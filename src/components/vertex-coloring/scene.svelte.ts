import type { Action } from "svelte/action";
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from "three";
import createColorAttribute from "./createColorAttribute";

const action: Action<HTMLCanvasElement> = (canvas) => {
	const renderer = new WebGLRenderer({
		antialias: true,
		canvas,
	});

	const width = canvas.parentElement?.clientWidth ?? 1;

	renderer.setSize(width, width);

	const geometry = new BoxGeometry();
	const position = geometry.getAttribute("position");

	// the default box geometry's vertex positions range from -0.5 -> 0.5
	const f = (n: number): number => 0.5 + n;
	const colorAttribute = createColorAttribute(position, f, f, f);
	geometry.setAttribute("color", colorAttribute);

	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	const mesh = new Mesh(geometry, material);
	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera();
	camera.position.set(2, 2, 2);
	camera.lookAt(mesh.position);

	const angle = (1 / (1 << 9)) * Math.PI;

	renderer.setAnimationLoop(() => {
		renderer.render(scene, camera);
		mesh.rotateY(angle);
	});

	$effect(() => {
		return () => {
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();
			renderer.setAnimationLoop(null);
			renderer.dispose();
		};
	});
};

export default action;
