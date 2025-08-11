<script lang="ts">
	import { createAttachment } from "./attachment.svelte";

	import { Checkbox, List, type ListOptions, Pane } from "svelte-tweakpane-ui";
	import { devicePixelRatio } from "svelte/reactivity/window";

	let flatShading = $state(true);
	let autoRotate = $state(true);
	let aspect = $state(16 / 9);

	let canvasWidth = $state(1);

	const canvasHeight = $derived(canvasWidth / aspect);
	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const attachment = createAttachment({
		getAspect: () => aspect,
		getAutoRotate: () => autoRotate,
		getCanvasHeight: () => canvasHeight,
		getCanvasWidth: () => canvasWidth,
		getFlatShading: () => flatShading,
		getPixelRatio: () => pixelRatio,
	});

	const aspects: ListOptions<number> = {
		"3:2": 3 / 2,
		"4:3": 4 / 3,
		"16:9": 16 / 9,
	};
</script>

<div bind:clientWidth={canvasWidth}>
	<canvas {@attach attachment}></canvas>
</div>

<div class="not-content">
	<Pane
		position="inline"
		title="flat-shading"
	>
		<Checkbox
			bind:value={flatShading}
			label="use flat shading"
		/>
		<Checkbox
			bind:value={autoRotate}
			label="auto rotate"
		/>
		<List
			bind:value={aspect}
			options={aspects}
			label="aspect ratio"
		/>
	</Pane>
</div>
