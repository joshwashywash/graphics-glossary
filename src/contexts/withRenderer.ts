import { getContext, setContext } from "svelte";
import type { WebGLRenderer } from "three";

export type WithRenderer = (renderer: WebGLRenderer) => (() => void) | void;

type SetWithRenderer = (withRenderer: WithRenderer) => void;
