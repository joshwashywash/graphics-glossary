<script lang="ts">
	import Example from "./example.svelte";

	import { Checkbox, Color, Pane, Slider } from "svelte-tweakpane-ui";

	let canvasWidth = $state(1);
	const aspect = 16 / 9;
	const canvasHeight = $derived(canvasWidth / aspect);

	let autoRotate = $state(true);
	let baseColor = $state("#000000");
	let fresnelColor = $state("#ffffff");
	let power = $state(1);
</script>

<div bind:clientWidth={canvasWidth}>
	<Example
		{aspect}
		{autoRotate}
		{baseColor}
		{canvasHeight}
		{canvasWidth}
		{fresnelColor}
		{power}
	/>
</div>

<div class="not-content">
	<Pane
		position="inline"
		title="schlick"
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
	</Pane>
</div>
