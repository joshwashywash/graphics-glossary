<script lang="ts">
	import type { SvelteHTMLElements } from "svelte/elements";

	let { children, ...restProps }: Omit<SvelteHTMLElements["div"], "class"> =
		$props();
</script>

<div
	{...restProps}
	class="not-content mt-4"
>
	{@render children?.()}
</div>
