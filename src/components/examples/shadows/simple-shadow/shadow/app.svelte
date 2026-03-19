<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";

	import createPaneAttachment from "@attachments/createPane";

	import PaneContainer from "@components/controls/PaneContainer.svelte";

	let width = $state(1);
	let height = $state(1);

	let shadowColor = $state("#ffffff");

	const pane = createPaneAttachment({
		initialize: (pane) => {
			pane.addBinding({ color: "#ffffff" }, "color").on("change", (e) => {
				shadowColor = e.value;
			});
		},
	});
</script>

<div class="relative">
	<PaneContainer
		{@attach pane}
		class="absolute top-2 right-2"
	/>

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
