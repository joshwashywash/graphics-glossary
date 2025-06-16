<!--
@component
creates a renderer through an attachment on a
-->

<script
	lang="ts"
	module
>
	const renderer = (
		getWidth: () => number,
		getHeight: () => number,
		getPixelRatio: () => number,
		withRenderer?: WithRenderer,
	): Attachment<HTMLCanvasElement> => {
		return (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
			});

			$effect(() => {
				renderer.setPixelRatio(getPixelRatio());
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

	let devicePixelRatio = $state(1);
</script>

<svelte:window bind:devicePixelRatio />

<canvas
	{...restProps}
	{@attach renderer(getWidth, getHeight, () => devicePixelRatio, withRenderer)}
>
	{@render children?.()}
</canvas>
