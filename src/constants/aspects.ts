import type { ListOptions } from "svelte-tweakpane-ui";

export const aspects: ListOptions<number> = {
	"3:2": 3 / 2,
	"4:3": 4 / 3,
	"16:9": 16 / 9,
} as const;
