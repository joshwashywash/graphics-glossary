import { powerParams } from "./FresnelMaterial";

import type { Attachment } from "svelte/attachments";
import { Pane } from "tweakpane";

export const createAttachment = (params: {
	baseColor: string;
	fresnelColor: string;
	power: number;
}): Attachment<HTMLElement> => {
	return (container) => {
		const pane = new Pane({
			container,
			title: "uniforms",
		});

		pane.addBinding(params, "baseColor", {
			label: "base color",
		});

		pane.addBinding(params, "fresnelColor", {
			label: "fresnel color",
		});

		pane.addBinding(params, "power", powerParams);

		return () => {
			pane.dispose();
		};
	};
};
