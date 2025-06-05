<script lang="ts">
	import Scene from "./scene.svelte";

	import Canvas from "@components/canvas.svelte";
	import Example from "@components/example.svelte";

	import { Element, Pane } from "svelte-tweakpane-ui";
</script>

<Example>
	<Pane
		position="inline"
		title="level of detail"
	>
		<Element>
			<Canvas>
				<Scene />
			</Canvas>
		</Element>
	</Pane>
</Example>
