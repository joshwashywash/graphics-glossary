import type { Attachment } from "svelte/attachments";
import type { WebGLRendererParameters } from "three";

export type CodeExampleTabItem = {
	icon?: string;
	lang: string;
	code: string;
	label: string;
};

export type CreateRendererAttachment = (
	rendererParameters: WebGLRendererParameters,
) => Attachment<HTMLCanvasElement>;
