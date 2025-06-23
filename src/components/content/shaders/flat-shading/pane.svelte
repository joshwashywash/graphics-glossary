<script lang="ts">
	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let {
		autoRotate = $bindable(true),
		flatShading = $bindable(true),
	}: {
		autoRotate: boolean;
		flatShading: boolean;
	} = $props();
</script>

<Pane
	position="inline"
	title="flat-shading"
>
	<Checkbox
		bind:value={flatShading}
		label="use flat shading"
	/>
	<Checkbox
		bind:value={autoRotate}
		label="auto rotate"
	/>
</Pane>
