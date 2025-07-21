<script lang="ts">
	import Example from "./example.svelte";

	let canvasWidth = $state(1);
	const aspect = 16 / 9;
	const canvasHeight = $derived(canvasWidth / aspect);
</script>

<div bind:clientWidth={canvasWidth}>
	<Example
		{canvasWidth}
		{canvasHeight}
		{aspect}
	/>
</div>
