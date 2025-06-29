<script lang="ts">
	import Example from "./example.svelte";
</script>

<svelte:boundary>
	<Example />

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>
