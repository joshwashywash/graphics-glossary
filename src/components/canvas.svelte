<script lang="ts">
	import Size from "@classes/Size.svelte";

	import { setSize } from "@contexts/size";
	import type { WithRenderer } from "@contexts/withRenderer";
	import { setWithRenderer } from "@contexts/withRenderer";

	import type { Attachment } from "svelte/attachments";
	import type { SvelteHTMLElements } from "svelte/elements";
	import { WebGLRenderer } from "three";

	let { children, ...restProps }: SvelteHTMLElements["div"] = $props();

	const size = setSize(new Size());

	let _withRenderer: WithRenderer | null = $state(null);

	setWithRenderer((withRenderer: WithRenderer) => {
		_withRenderer = withRenderer;
	});

	const renderer: Attachment<HTMLCanvasElement> = (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setSize(size.width, size.height);
		});

		$effect(() => {
			return _withRenderer?.(renderer);
		});

		return renderer.dispose;
	};
</script>

<div
	bind:clientWidth={size.width}
	{...restProps}
>
	<canvas {@attach renderer}>
		{@render children?.()}
	</canvas>
</div>
