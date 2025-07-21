<script lang="ts">
	import Example from "./example.svelte";

	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let autoRotate = $state(true);

	let canvasWidth = $state(1);
	const aspect = 16 / 9;
	const canvasHeight = $derived(canvasWidth / aspect);
</script>

<div bind:clientWidth={canvasWidth}>
	<Example
		{aspect}
		{autoRotate}
		{canvasHeight}
		{canvasWidth}
	/>
</div>

<div class="not-content">
	<Pane
		title="vertex colors"
		position="inline"
	>
		<Checkbox
			bind:value={autoRotate}
			label="auto rotate"
		/>
	</Pane>
</div>
