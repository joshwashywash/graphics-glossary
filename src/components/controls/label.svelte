<script lang="ts">
	import type { HTMLLabelAttributes } from "svelte/elements";

	let { children, ...props }: HTMLLabelAttributes = $props();
</script>

<label
	{...props}
	class={["flex items-center justify-between gap-2", props.class]}
>
	{@render children?.()}
</label>
