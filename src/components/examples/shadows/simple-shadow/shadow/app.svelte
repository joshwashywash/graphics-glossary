<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";

	import { Label } from "@components/controls";

	let width = $state(1);
	let height = $state(1);

	let shadowColor = $state("#ffffff");
</script>

<div class="relative">
	<details class="example-pane">
		<summary>controls</summary>
		<Label>
			shadow color
			<input
				type="color"
				bind:value={shadowColor}
			/>
		</Label>
	</details>

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
</div>
