<script lang="ts">
	import { aspects } from "@constants/aspects";
	import { List, Pane } from "svelte-tweakpane-ui";

	let { aspect = $bindable(4 / 3) } = $props();
</script>

<Pane position="inline">
	<List
		bind:value={aspect}
		options={aspects}
		label="aspect ratio"
	/>
</Pane>
