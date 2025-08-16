<script lang="ts">
	import { aspects } from "@constants/aspects";
	import { List, Pane } from "svelte-tweakpane-ui";

	let { aspect = $bindable(16 / 9) } = $props();
</script>

<Pane
	position="inline"
	title="level-of-detail"
>
	<List
		bind:value={aspect}
		options={aspects}
		label="aspect ratio"
	/>
</Pane>
