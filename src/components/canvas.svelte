<script
	lang="ts"
	module
>
	const renderer = (
		getWidth: () => number,
		getHeight: () => number,
		withRenderer?: WithRenderer,
	): Attachment<HTMLCanvasElement> => {
		return (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
			});

			$effect(() => {
				renderer.setPixelRatio(devicePixelRatio.current ?? 1);
			});

			$effect(() => {
				renderer.setSize(getWidth(), getHeight());
			});

			$effect(() => {
				return withRenderer?.(renderer);
			});

			return renderer.dispose;
		};
	};
</script>

<script lang="ts">
	import type { WithRenderer } from "@types";
	import type { Attachment } from "svelte/attachments";
	import type { SvelteHTMLElements } from "svelte/elements";
	import { WebGLRenderer } from "three";
	import {devicePixelRatio} from 'svelte/reactivity/window'

	let {
		children,
		getWidth,
		getHeight,
		withRenderer,
		...restProps
	}: SvelteHTMLElements["canvas"] & {
		getWidth: () => number;
		getHeight: () => number;
		withRenderer?: WithRenderer;
	} = $props();

</script>

<canvas
	{...restProps}
	{@attach renderer(getWidth, getHeight, withRenderer)}
>
	{@render children?.()}
</canvas>
