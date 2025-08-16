<script lang="ts">
	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let { autoRotate = $bindable(16 / 9) } = $props();
</script>

<Pane
	position="inline"
	title="billboarding"
>
	<Checkbox
		bind:value={autoRotate}
		label="auto rotate camera"
	/>
</Pane>
