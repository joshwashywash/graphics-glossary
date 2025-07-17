<script lang="ts">
	import Example from "./example.svelte";

	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let renderVisualizationScene = $state(false);

	let width = $state(1);
	const aspect = 16 / 9;
	const height = $derived(width / aspect);
</script>

<svelte:boundary>
	<div bind:clientWidth={width}>
		<Example
			{renderVisualizationScene}
			{width}
			{height}
			{aspect}
		/>
	</div>

	{#snippet pending()}
		<p>loading</p>
	{/snippet}

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>

<div class="not-content">
	<Pane
		position="inline"
		title="billboarding"
	>
		<Checkbox
			bind:value={renderVisualizationScene}
			label="render visualization scene"
		/>
	</Pane>
</div>
