<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";

	import { untrack } from "svelte";
	import type { Attachment } from "svelte/attachments";
	import type { SvelteHTMLElements } from "svelte/elements";
	import { Pane } from "tweakpane";

	let props: SvelteHTMLElements["div"] = $props();

	let aspect = $state(4 / 3);
	let canvasWidth = $state(1);
	const canvasHeight = $derived(canvasWidth / aspect);

	let shadowColor = $state("#ffffff");

	const createPaneAttachment = (params: {
		shadowColor: string;
	}): Attachment<HTMLElement> => {
		return (container) => {
			const pane = new Pane({
				container,
				title: "controls",
			});

			pane.addBinding(params, "shadowColor", {
				label: "shadow color",
			});

			return () => {
				pane.dispose();
			};
		};
	};

	const pane = createPaneAttachment({
		get shadowColor() {
			return untrack(() => shadowColor);
		},
		set shadowColor(value) {
			shadowColor = value;
		},
	});
</script>

<div
	bind:clientWidth={canvasWidth}
	class="relative"
	{...props}
>
	<div
		class="absolute top-0 right-4 not-content"
		{@attach pane}
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
