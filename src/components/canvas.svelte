<script lang="ts">
	import { getSize } from "@contexts/size";
	import type { WithRenderer } from "@contexts/withRenderer";

	import type { Attachment } from "svelte/attachments";
	import type { SvelteHTMLElements } from "svelte/elements";
	import { WebGLRenderer } from "three";

	let {
		children,
		withRenderer,
		...restProps
	}: SvelteHTMLElements["canvas"] & { withRenderer?: WithRenderer } = $props();

	const size = getSize();

	let devicePixelRatio = $state(1);

	const renderer: Attachment<HTMLCanvasElement> = (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setPixelRatio(devicePixelRatio);
		});

		$effect(() => {
			renderer.setSize(size.width, size.height);
		});

		$effect(() => {
			return withRenderer?.(renderer);
		});

		return renderer.dispose;
	};
</script>

<svelte:window bind:devicePixelRatio />

<canvas
	{...restProps}
	{@attach renderer}
>
	{@render children?.()}
</canvas>
