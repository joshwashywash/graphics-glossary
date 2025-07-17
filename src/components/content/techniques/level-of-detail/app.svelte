<script lang="ts">
	import Example from "./example.svelte";

	let width = $state(1);
	const aspect = 16 / 9;
	const height = $derived(width / aspect);
</script>

<div bind:clientWidth={width}>
	<Example
		{width}
		{height}
		{aspect}
	/>
</div>
