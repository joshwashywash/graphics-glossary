<script lang="ts">
	import Example from "./example.svelte";

	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let autoRotate = $state(true);

	let width = $state(1);
	const aspect = 16 / 9;
	const height = $derived(width / aspect);
</script>

<div bind:clientWidth={width}>
	<Example
		{autoRotate}
		{width}
		{height}
		{aspect}
	/>
</div>

<div class="not-content">
	<Pane
		title="vertex colors"
		position="inline"
	>
		<Checkbox
			bind:value={autoRotate}
			label="auto rotate"
		/>
	</Pane>
</div>
