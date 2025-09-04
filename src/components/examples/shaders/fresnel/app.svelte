<script lang="ts">
	import { createFresnel } from "./attachment.svelte";
	import { State } from "./state.svelte";

	import { aspects } from "@constants/aspects";
	import {
		Checkbox,
		Color,
		Folder,
		List,
		Pane,
		Slider,
	} from "svelte-tweakpane-ui";

	const state = new State();

	const { attachment, dispose } = createFresnel(state);

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
			<List
				bind:value={state.aspect}
				options={aspects}
				label="aspect ratio"
			/>
			<Checkbox
				bind:value={state.useAutoRotate}
				label="auto rotate camera"
			/>
			<Folder title="uniforms">
				<Color
					bind:value={state.baseColor}
					label="base color"
				/>
				<Color
					bind:value={state.fresnelColor}
					label="fresnel color"
				/>
				<Slider
					bind:value={state.power}
					label="power"
					min={0}
					max={5}
					step={0.1}
				/>
			</Folder>
		</Pane>
	</div>
</div>
