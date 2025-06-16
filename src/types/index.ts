import type { WebGLRenderer } from "three";

export type CodeExampleTabItem = {
	icon?: string;
	lang: string;
	code: string;
	label: string;
};

export type WithRenderer = (renderer: WebGLRenderer) => (() => void) | void;
