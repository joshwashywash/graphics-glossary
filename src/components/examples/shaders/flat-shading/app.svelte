<script lang="ts">
	import { createFlatShading } from "./attachment.svelte";
	import { State } from "./state.svelte";

	import { aspects } from "@constants/aspects";
	import { Checkbox, List, Pane } from "svelte-tweakpane-ui";

	const state = new State();

	const { attachment, dispose } = createFlatShading(state);

	$effect(() => {
		return dispose;
	});
</script>

<div
	bind:clientWidth={state.canvasWidth}
	class="sm:relative"
>
	<canvas {@attach attachment}></canvas>
	<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
		<Pane position="inline">
			<Checkbox
				bind:value={state.useFlatShading}
				label="use flat shading"
			/>
			<Checkbox
				bind:value={state.autoRotateCamera}
				label="auto rotate camera"
			/>
			<List
				bind:value={state.aspect}
				options={aspects}
				label="aspect ratio"
			/>
		</Pane>
	</div>
</div>
