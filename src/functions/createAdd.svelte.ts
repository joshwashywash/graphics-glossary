import type { Object3D, Scene } from "three";

export const createAdd = (getScene: () => Scene) => {
	return (getObject: () => Object3D) => {
		$effect(() => {
			const scene = getScene();
			const o = getObject();

			scene.add(o);

			return () => {
				scene.remove(o);
			};
		});
	};
};
