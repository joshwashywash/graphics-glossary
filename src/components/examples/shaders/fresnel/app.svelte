<script lang="ts">
	import { createAttachment } from "./attachment.svelte";

	import { Checkbox, Color, List, Pane, Slider } from "svelte-tweakpane-ui";
	import type { ListOptions } from "svelte-tweakpane-ui";
	import { devicePixelRatio } from "svelte/reactivity/window";

	let canvasWidth = $state(1);
	let aspect = $state(16 / 9);
	const canvasHeight = $derived(canvasWidth / aspect);

	let autoRotate = $state(true);
	let baseColor = $state("#000000");
	let fresnelColor = $state("#ffffff");
	let power = $state(1);

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const attachment = createAttachment({
		getAspect: () => aspect,
		getAutoRotate: () => autoRotate,
		getBaseColor: () => baseColor,
		getCanvasHeight: () => canvasHeight,
		getCanvasWidth: () => canvasWidth,
		getFresnelColor: () => fresnelColor,
		getPixelRatio: () => pixelRatio,
		getPower: () => power,
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
		title="fresnel effect"
	>
		<Checkbox
			bind:value={autoRotate}
			label="auto rotate"
		/>
		<Color
			bind:value={baseColor}
			label="base color"
		/>
		<Color
			bind:value={fresnelColor}
			label="fresnel color"
		/>
		<Slider
			bind:value={power}
			label="power"
			min={0}
			max={5}
			step={0.1}
		/>
		<List
			bind:value={aspect}
			options={aspects}
			label="aspect ratio"
		/>
	</Pane>
</div>
