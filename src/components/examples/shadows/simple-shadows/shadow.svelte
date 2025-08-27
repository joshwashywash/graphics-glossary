<script lang="ts">
	import { createShadowGradient } from "./createShadowGradient";

	import type { HTMLCanvasAttributes } from "svelte/elements";

	type Props = {
		backgroundColor: string;
		shadowColor: string;
		size: number;
	};

	let {
		backgroundColor = "black",
		shadowColor = "rgba(0,0,0,0)",
		...props
	}: HTMLCanvasAttributes & Partial<Props> = $props();
</script>

<canvas
	{...props}
	{@attach (canvas) => {
		const context = canvas.getContext("2d");
		if (context === null) return;

		$effect(() => {
			const gradient = createShadowGradient(
				context,
				backgroundColor,
				shadowColor,
			);

			context.fillStyle = gradient;
			context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		});
	}}
>
</canvas>
