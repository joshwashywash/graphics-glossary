<script lang="ts">
	import Example from "./example.svelte";

	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let width = $state(1);
	const aspect = 16 / 9;
	const height = $derived(width / aspect);

	let autoRotate = $state(false);
</script>

<svelte:boundary>
	<div bind:clientWidth={width}>
		<Example
			{width}
			{height}
			{aspect}
			{autoRotate}
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
		title="billboarding"
		position="inline"
	>
		<Checkbox
			bind:value={autoRotate}
			label="auto rotate camera"
		/>
	</Pane>
</div>
