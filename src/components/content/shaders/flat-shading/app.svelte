<script lang="ts">
	import Example from "./example.svelte";

	import { Checkbox, Pane } from "svelte-tweakpane-ui";

	let flatShading = $state(true);
	let autoRotate = $state(true);

	let width = $state(1);
	const aspect = 16 / 9;

	const height = $derived(width / aspect);
</script>

<div bind:clientWidth={width}>
	<Example
		{width}
		{height}
		{aspect}
	/>
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
	</Pane>
</div>
