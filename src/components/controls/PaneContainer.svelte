<script lang="ts">
	import type { SvelteHTMLElements } from "svelte/elements";

	const { children, ...rest }: SvelteHTMLElements["div"] = $props();
</script>

<div
	{...rest}
	class={["w-3xs not-content", rest.class]}
>
	{@render children?.()}
</div>
