<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";

	import { Label, Pane } from "@components/controls";

	import type { SvelteHTMLElements } from "svelte/elements";

	let props: SvelteHTMLElements["div"] = $props();

	let width = $state(1);
	let height = $state(1);

	let shadowColor = $state("#ffffff");
</script>

<div
	class="relative"
	{...props}
>
	<Pane class="absolute top-2 right-2">
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
	</Pane>
	<canvas
		bind:clientWidth={width}
		bind:clientHeight={height}
		class="w-full aspect-square"
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
