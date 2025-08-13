<script lang="ts">
	import { createAttachment } from "./attachment.svelte";

	import { List, Pane } from "svelte-tweakpane-ui";
	import type { ListOptions } from "svelte-tweakpane-ui";
	import { devicePixelRatio } from "svelte/reactivity/window";

	let canvasWidth = $state(1);
	let aspect = $state(16 / 9);

	const canvasHeight = $derived(canvasWidth / aspect);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const attachment = createAttachment({
		getAspect: () => aspect,
		getCanvasHeight: () => canvasHeight,
		getCanvasWidth: () => canvasWidth,
		getPixelRatio: () => pixelRatio,
	});

	const aspects: ListOptions<number> = {
		"3:2": 3 / 2,
		"4:3": 4 / 3,
		"16:9": 16 / 9,
	} as const;
</script>

<svelte:boundary>
	<div bind:clientWidth={canvasWidth}>
		<canvas {@attach attachment}></canvas>
	</div>

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>

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
