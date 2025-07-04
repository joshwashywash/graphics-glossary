<script lang="ts">
	import Example from "./example.svelte";

	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let renderVisualizationScene = $state(false);
</script>

<svelte:boundary>
	<Example {renderVisualizationScene} />

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
