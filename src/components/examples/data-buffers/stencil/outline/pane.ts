import type { Attachment } from "svelte/attachments";
import { Pane } from "tweakpane";

export const createAttachment = (params: {
	outlineColor: string;
	outlinesVisible: boolean;
	outlineScale: number;
}): Attachment<HTMLElement> => {
	return (container) => {
		const pane = new Pane({
			container,
			title: "controls",
		});

		pane.addBinding(params, "outlinesVisible", {
			label: "show outlines",
		});
		pane.addBinding(params, "outlineColor", {
			label: "outline color",
		});
		pane.addBinding(params, "outlineScale", {
			label: "outline size",
			min: 1,
			max: 2,
			step: 0.1,
		});

		return () => {
			pane.dispose();
		};
	};
};
