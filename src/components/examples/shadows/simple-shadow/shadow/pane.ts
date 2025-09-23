import type { Attachment } from "svelte/attachments";
import { Pane } from "tweakpane";

export const createAttachment = (params: {
	shadowColor: string;
}): Attachment<HTMLElement> => {
	return (container) => {
		const pane = new Pane({
			container,
			title: "controls",
		});

		pane.addBinding(params, "shadowColor", {
			label: "shadow color",
		});

		return () => {
			pane.dispose();
		};
	};
};
