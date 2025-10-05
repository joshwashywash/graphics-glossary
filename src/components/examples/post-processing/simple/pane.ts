import type { Attachment } from "svelte/attachments";
import { Pane } from "tweakpane";

export const createAttachment = (params: {
	alpha: number;
	color: string;
}): Attachment<HTMLElement> => {
	return (container) => {
		const pane = new Pane({
			container,
			title: "uniforms",
		});

		pane.addBinding(params, "alpha", {
			min: 0,
			max: 1,
			step: 0.1,
		});

		pane.addBinding(params, "color");

		return () => {
			pane.dispose();
		};
	};
};
