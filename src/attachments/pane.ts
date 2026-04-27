import type { Attachment } from "svelte/attachments";
import { Pane } from "tweakpane";
import type { PaneConfig } from "tweakpane/dist/types/pane/pane-config";

export const pane = (
	config: Omit<PaneConfig, "container"> = {},
	init?: (pane: Pane) => void,
): Attachment<HTMLElement> => {
	return (container) => {
		const pane = new Pane({
			...config,
			container,
		});
		init?.(pane);
		return () => {
			pane.dispose();
		};
	};
};
