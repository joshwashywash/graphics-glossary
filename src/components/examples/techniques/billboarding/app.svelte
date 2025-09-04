<script lang="ts">
	import { createBillboarding } from "./attachment.svelte";
	import { State } from "./state.svelte";

	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	const state = new State();

	const { attachment, dispose } = createBillboarding(state);

	$effect(() => {
		return dispose;
	});
</script>

<svelte:boundary>
	<div
		bind:clientWidth={state.canvasWidth}
		class="sm:relative"
	>
		<canvas {@attach attachment}></canvas>
		<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
			<Pane position="inline">
				<Checkbox
					bind:value={state.useAutoRotate}
					label="auto rotate camera"
				/>
			</Pane>
		</div>
	</div>

	{#snippet pending()}
		<p>loading</p>
	{/snippet}

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>
