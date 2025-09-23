import type { Attachment } from "svelte/attachments";
import { Pane } from "tweakpane";

export const createAttachment = (params: {
	invert: boolean;
}): Attachment<HTMLElement> => {
	return (container) => {
		const pane = new Pane({
			container,
			title: "controls",
		});

		pane.addBinding(params, "invert");

		return () => {
			pane.dispose();
		};
	};
};
