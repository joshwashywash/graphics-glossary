<script lang="ts">
	import { Checkbox, Color, Pane, Slider } from "svelte-tweakpane-ui";

	let {
		autoRotate = $bindable(true),
		baseColor = $bindable("#000000"),
		fresnelColor = $bindable("#ffffff"),
		power = $bindable(1),
	}: {
		autoRotate: boolean;
		baseColor: string;
		fresnelColor: string;
		power: number;
	} = $props();
</script>

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
