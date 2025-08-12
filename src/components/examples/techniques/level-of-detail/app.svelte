<script lang="ts">
	import { createAttachment } from "./attachment.svelte";

	import { List, Pane } from "svelte-tweakpane-ui";
	import type { ListOptions } from "svelte-tweakpane-ui";

	let canvasWidth = $state(1);
	let aspect = $state(16 / 9);

	const canvasHeight = $derived(canvasWidth / aspect);

	const attachment = createAttachment({
		getAspect: () => aspect,
		getCanvasHeight: () => canvasHeight,
		getCanvasWidth: () => canvasWidth,
	});

	const aspects: ListOptions<number> = {
		"3:2": 3 / 2,
		"4:3": 4 / 3,
		"16:9": 16 / 9,
	} as const;
</script>

<div bind:clientWidth={canvasWidth}>
	<canvas {@attach attachment}></canvas>
</div>

<div class="not-content">
	<Pane
		position="inline"
		title="level-of-detail"
	>
		<List
			bind:value={aspect}
			options={aspects}
			label="aspect ratio"
		/>
	</Pane>
</div>
