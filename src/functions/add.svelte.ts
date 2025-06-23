import type { Object3D } from "three";

/**
 * adds *child* to *parent* in an effect. when the effect is reran, *child* is removed from *parent*
 */
export const add = (getParent: () => Object3D, getChild: () => Object3D) => {
	$effect(() => {
		const child = getChild();
		const parent = getParent().add(child);
		return () => {
			parent.remove(child);
		};
	});
};
