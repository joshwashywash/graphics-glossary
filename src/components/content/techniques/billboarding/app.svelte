<script lang="ts">
	import Example from "./example.svelte";
</script>

<svelte:boundary>
	<Example />

	{#snippet failed(error)}
		<span>{error}</span>
	{/snippet}
</svelte:boundary>
