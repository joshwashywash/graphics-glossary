import type Size from "@classes/Size.svelte";

import { getContext, setContext } from "svelte";

const key = {};

export const getSize = (): Size => {
	return getContext(key);
};

export const setSize = (size: Size): Size => {
	return setContext(key, size);
};
