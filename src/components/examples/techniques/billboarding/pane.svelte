<script lang="ts">
	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let { autoRotate = $bindable(4 / 3) } = $props();
</script>

<Pane position="inline">
	<Checkbox
		bind:value={autoRotate}
		label="auto rotate camera"
	/>
</Pane>
