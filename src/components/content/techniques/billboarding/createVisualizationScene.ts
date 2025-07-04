import {
	CameraHelper,
	CanvasTexture,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
} from "three";

export const createVisualizationScene = (
	canvasTexture: CanvasTexture,
	camera: PerspectiveCamera,
) => {
	const helper = new CameraHelper(camera);

	const planeMaterial = new MeshBasicMaterial({
		map: canvasTexture,
	});

	const planeGeometry = new PlaneGeometry();

	const plane = new Mesh(planeGeometry, planeMaterial);

	const scene = new Scene().add(helper, plane);

	const dispose = () => {
		scene.remove(plane, helper);
		helper.dispose();
		planeMaterial.map = null;
		planeMaterial.dispose();
		planeGeometry.dispose();
	};

	return {
		dispose,
		plane,
		scene,
	};
};
