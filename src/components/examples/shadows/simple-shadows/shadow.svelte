<script lang="ts">
	import { createShadowGradient } from "./createShadowGradient";

	let {
		backgroundColor = "black",
		shadowColor = "rgba(0,0,0,0)",
		size = 256,
	} = $props();
</script>

<canvas
	width={size}
	height={size}
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
			context.fillRect(0, 0, size, size);
		});
	}}
>
</canvas>
