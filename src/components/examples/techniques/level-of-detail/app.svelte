<script lang="ts">
	import { createLevelOfDetail } from "./attachment.svelte";
	import { State } from "./state.svelte";

	import { aspects } from "@constants/aspects";
	import { List, Pane } from "svelte-tweakpane-ui";

	const state = new State();

	const { attachment, dispose } = createLevelOfDetail(state);

	$effect(() => {
		return dispose;
	});
</script>

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
		</Pane>
	</div>
	<canvas {@attach attachment}></canvas>
</div>
