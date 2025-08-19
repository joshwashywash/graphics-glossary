<script lang="ts">
	import { aspects } from "@constants/aspects";
	import { Checkbox, List, Pane } from "svelte-tweakpane-ui";

	let {
		flatShading = $bindable(true),
		autoRotate = $bindable(true),
		aspect = $bindable(4 / 3),
	} = $props();
</script>

<Pane position="inline">
	<Checkbox
		bind:value={flatShading}
		label="use flat shading"
	/>
	<Checkbox
		bind:value={autoRotate}
		label="auto rotate"
	/>
	<List
		bind:value={aspect}
		options={aspects}
		label="aspect ratio"
	/>
</Pane>
