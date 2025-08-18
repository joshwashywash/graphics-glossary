import type { ListOptionsRecord } from "svelte-tweakpane-ui";

export const aspects: ListOptionsRecord<number> = {
	"3:2": 3 / 2,
	"4:3": 4 / 3,
	"16:9": 16 / 9,
} as const;
