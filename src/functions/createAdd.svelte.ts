import type { Object3D, Scene } from "three";

export const createAdd = (getParent: () => Object3D) => {
	return (getChild: () => Object3D) => {
		$effect(() => {
			const parent = getParent();
			const child = getChild();

			parent.add(child);

			return () => {
				parent.remove(child);
			};
		});
	};
};
