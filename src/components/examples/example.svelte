<script lang="ts">
	import type { Snippet } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";

	type Props = {
		pane: Snippet;
	};

	let { children, pane, ...props }: SvelteHTMLElements["div"] & Props =
		$props();
</script>

<div
	{...props}
	class={["relative", props.class]}
>
	<div
		{...props}
		class="absolute top-2 right-2 py-1 bg-black/90 px-4 rounded-lg not-content min-w-3xs sm:mi-w-2xs md:min-w-xs"
	>
		{@render pane()}
	</div>
	{@render children?.()}
</div>
