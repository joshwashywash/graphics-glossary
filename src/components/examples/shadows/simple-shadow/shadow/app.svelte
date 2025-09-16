<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";

	import { Color, Pane } from "svelte-tweakpane-ui";
	import type { SvelteHTMLElements } from "svelte/elements";

	let { ...props }: SvelteHTMLElements["div"] = $props();

	let aspect = $state(4 / 3);
	let canvasWidth = $state(1);
	const canvasHeight = $derived(canvasWidth / aspect);

	let shadowColor = $state("#ffffff");
</script>

<div
	bind:clientWidth={canvasWidth}
	class="relative"
	{...props}
>
	<div class="absolute bottom-4 right-4 not-content">
		<Pane position="inline">
			<Color
				bind:value={shadowColor}
				label="shadow color"
			/>
		</Pane>
	</div>
	<canvas
		width={canvasWidth}
		height={canvasHeight}
		{@attach (canvas) => {
			const context = canvas.getContext("2d");
			if (context === null) return;

			$effect(() => {
				canvasWidth;
				canvasHeight;
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
