<script lang="ts">
	import { aspects } from "@constants/aspects";
	import {
		Checkbox,
		Color,
		Folder,
		List,
		Pane,
		Slider,
	} from "svelte-tweakpane-ui";

	let {
		aspect = $bindable(4 / 3),
		autoRotate = $bindable(true),
		baseColor = $bindable("#000000"),
		fresnelColor = $bindable("#ffffff"),
		power = $bindable(1),
	} = $props();
</script>

<Pane position="inline">
	<List
		bind:value={aspect}
		options={aspects}
		label="aspect ratio"
	/>
	<Checkbox
		bind:value={autoRotate}
		label="auto rotate"
	/>
	<Folder title="uniforms">
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
	</Folder>
</Pane>
