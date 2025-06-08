<script lang="ts">
	import Scene from "./scene.svelte";

	import Canvas from "@components/canvas.svelte";
	import Example from "@components/example.svelte";

	import { Checkbox, Element, Pane } from "svelte-tweakpane-ui";

	let flatShading = $state(true);
	let autoRotate = $state(true);
</script>

<Example>
	<Pane
		position="inline"
		title="flat-shading"
	>
		<Element>
			<Canvas>
				<Scene
					{autoRotate}
					{flatShading}
				/>
			</Canvas>
		</Element>
		<Checkbox
			bind:value={flatShading}
			label="use flat shading"
		/>
		<Checkbox
			bind:value={autoRotate}
			label="auto rotate"
		/>
	</Pane>
</Example>
