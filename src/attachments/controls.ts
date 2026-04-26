import type { Attachment } from "svelte/attachments";
import type { Controls } from "three/webgpu";

export const controls = (controls: Controls): Attachment<HTMLCanvasElement> => {
	return (canvas) => {
		controls.connect(canvas);
		return () => {
			controls.disconnect();
		};
	};
};
