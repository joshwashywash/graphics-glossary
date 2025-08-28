<script lang="ts">
	import { aspects } from "@constants/aspects";
	import { Checkbox, List, Pane } from "svelte-tweakpane-ui";

	let { aspect = $bindable(4 / 3), useAutoRotate = $bindable(true) } = $props();
</script>

<Pane position="inline">
	<Checkbox
		bind:value={useAutoRotate}
		label="auto rotate camera"
	/>
	<List
		bind:value={aspect}
		options={aspects}
		label="aspect ratio"
	/>
</Pane>
