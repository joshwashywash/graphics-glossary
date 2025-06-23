import type { Object3D } from "three";

/**
 * returns a function that adds *child* to *parent* in an effect. when the effect is reran, *child* is removed from *parent*
 */
export const createAdd = (getParent: () => Object3D) => {
	return (getChild: () => Object3D) => {
		$effect(() => {
			const child = getChild();
			const parent = getParent().add(child);
			return () => {
				parent.remove(child);
			};
		});
	};
};
