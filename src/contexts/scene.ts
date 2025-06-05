import { getContext, setContext } from "svelte";
import type { Scene } from "three";

const key = {};

export const getScene = (): Scene => {
	return getContext(key);
};

export const setScene = (scene: Scene): Scene => {
	return setContext(key, scene);
};
