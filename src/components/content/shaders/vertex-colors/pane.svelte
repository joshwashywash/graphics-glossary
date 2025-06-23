<script lang="ts">
	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let {
		autoRotate = $bindable(true),
	}: {
		autoRotate: boolean;
	} = $props();
</script>

<Pane
	title="vertex colors"
	position="inline"
>
	<Checkbox
		bind:value={autoRotate}
		label="auto rotate"
	/>
</Pane>
