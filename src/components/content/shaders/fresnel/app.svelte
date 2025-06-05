<script lang="ts">
	import Scene from "./scene.svelte";

	import Canvas from "@components/canvas.svelte";
	import Example from "@components/example.svelte";

	import { Checkbox, Color, Element, Pane, Slider } from "svelte-tweakpane-ui";

	let autoRotate = $state(true);

	let baseColor = $state("#000000");
	let fresnelColor = $state("#ffffff");
	let power = $state(1);
</script>

<Example>
	<Pane
		position="inline"
		title="schlick"
	>
		<Element>
			<Canvas>
				<Scene
					{autoRotate}
					{baseColor}
					{fresnelColor}
					{power}
				/>
			</Canvas>
		</Element>
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
</Example>
