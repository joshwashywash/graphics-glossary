<script lang="ts">
	import { createShadowMesh } from "./attachment.svelte";
	import { State } from "./state.svelte";

	const state = new State();

	const { attachment, dispose } = createShadowMesh(state);

	$effect(() => {
		return dispose;
	});
</script>

<div bind:clientWidth={state.canvasWidth}>
	<canvas {@attach attachment}></canvas>
</div>
