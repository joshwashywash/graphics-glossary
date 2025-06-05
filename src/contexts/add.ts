import { getContext, setContext } from "svelte";
import type { Object3D, Scene } from "three";

type Add = (o: Object3D) => Scene;

const key = {};

export const getAdd = (): Add => {
	return getContext(key);
};

export const setAdd = (add: Add): Add => {
	return setContext(key, add);
};
