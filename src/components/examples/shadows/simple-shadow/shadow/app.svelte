<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";

	import GUI from "lil-gui";
	import { untrack } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";

	let { ...props }: SvelteHTMLElements["div"] = $props();

	let aspect = $state(4 / 3);
	let canvasWidth = $state(1);
	const canvasHeight = $derived(canvasWidth / aspect);

	let shadowColor = $state("#ffffff");

	const params = {
		get shadowColor() {
			return untrack(() => shadowColor);
		},
		set shadowColor(value) {
			shadowColor = value;
		},
	};
</script>

<div
	bind:clientWidth={canvasWidth}
	class="relative"
	{...props}
>
	<div
		class="absolute top-0 right-4 not-content"
		{@attach (container) => {
			const gui = new GUI({
				container,
			});

			gui.addColor(params, "shadowColor").name("shadow color");

			return gui.destroy;
		}}
	></div>
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
