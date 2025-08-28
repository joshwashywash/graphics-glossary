<script lang="ts">
	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let { useAutoRotate = $bindable(true) } = $props();
</script>

<Pane position="inline">
	<Checkbox
		bind:value={useAutoRotate}
		label="auto rotate camera"
	/>
</Pane>
