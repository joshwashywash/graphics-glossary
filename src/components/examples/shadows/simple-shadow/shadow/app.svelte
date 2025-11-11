<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	let width = $state(1);
	let height = $state(1);

	let shadowColor = $state("#ffffff");
</script>

<Example>
	{#snippet pane()}
		<details open>
			<summary>controls</summary>
			<Label>
				shadow color
				<input
					type="color"
					bind:value={shadowColor}
				/>
			</Label>
		</details>
	{/snippet}

	<canvas
		bind:clientWidth={width}
		bind:clientHeight={height}
		class="example-canvas"
		{width}
		{height}
		{@attach (canvas) => {
			const context = canvas.getContext("2d");
			if (context === null) return;

			$effect(() => {
				width;
				height;
				const gradient = createShadowGradient(context, shadowColor);

				context.fillStyle = gradient;
				context.fillRect(0, 0, context.canvas.width, context.canvas.height);
				return () => {
					context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				};
			});
		}}
	>
	</canvas>
</Example>
