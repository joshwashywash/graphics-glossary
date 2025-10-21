<script lang="ts">
	import type { SvelteHTMLElements } from "svelte/elements";

	let { children, ...props }: SvelteHTMLElements["div"] = $props();
</script>

<div
	{...props}
	class={[
		"py-1 bg-black/90 px-4 rounded-lg not-content min-w-3xs sm:mi-w-2xs md:min-w-xs",
		props.class,
	]}
>
	{@render children?.()}
</div>
