import { getContext, setContext } from "svelte";
import type { WebGLRenderer } from "three";

export type WithRenderer = (renderer: WebGLRenderer) => (() => void) | void;

type SetWithRenderer = (withRenderer: WithRenderer) => void;

const key = {};

export const getWithRenderer = (): SetWithRenderer => {
	return getContext(key);
};

export const setWithRenderer = (callback: SetWithRenderer): SetWithRenderer => {
	return setContext(key, callback);
};
