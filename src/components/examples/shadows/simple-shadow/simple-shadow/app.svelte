<script lang="ts">
	import { createSimpleShadow } from "./attachment.svelte";
	import { State } from "./state.svelte";

	import { aspects } from "@constants/aspects";
	import { Color, List, Pane } from "svelte-tweakpane-ui";

	const state = new State();

	const { attachment, dispose } = createSimpleShadow(state);

	$effect(() => {
		return dispose;
	});
</script>

<svelte:boundary>
	<div
		bind:clientWidth={state.canvasWidth}
		class="sm:relative"
	>
		<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
			<Pane position="inline">
				<List
					bind:value={state.aspect}
					options={aspects}
					label="aspect ratio"
				/>
				<Color
					bind:value={state.shadowColor}
					label="shadow color"
				/>
			</Pane>
		</div>
		<canvas {@attach attachment}></canvas>
	</div>

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>
