<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";

	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { useDisposable } from "@functions/useDisposable.svelte";

	import { Pane } from "tweakpane";

	let width = $state(1);
	let height = $state(1);

	let shadowColor = $state("#ffffff");
</script>

<div class="relative">
	<PaneContainer
		{@attach (container) => {
			const pane = useDisposable(Pane, {
				container,
				expanded: false,
				title: "controls",
			});

			pane.addBinding({ color: "#ffffff" }, "color").on("change", (e) => {
				shadowColor = e.value;
			});
		}}
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
