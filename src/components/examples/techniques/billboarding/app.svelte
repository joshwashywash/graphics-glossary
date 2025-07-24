<script lang="ts">
	import Example from "./example.svelte";

	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let canvasWidth = $state(1);
	const aspect = 16 / 9;
	const canvasHeight = $derived(canvasWidth / aspect);

	let autoRotate = $state(true);
</script>

<svelte:boundary>
	<div bind:clientWidth={canvasWidth}>
		<Example
			{aspect}
			{autoRotate}
			{canvasHeight}
			{canvasWidth}
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
			bind:value={autoRotate}
			label="auto rotate camera"
		/>
	</Pane>
</div>
