<script lang="ts">
	import Example from "./example.svelte";

	let canvasWidth = $state(1);
	const aspect = 16 / 9;

	const canvasHeight = $derived(canvasWidth / aspect);
</script>

<svelte:boundary>
	<div bind:clientWidth={canvasWidth}>
		<Example
			{canvasWidth}
			{canvasHeight}
		/>
	</div>

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>
