<script lang="ts">
	import type { HTMLCanvasAttributes } from "svelte/elements";
	import type { WebGLRendererParameters } from "three";
	import { WebGLRenderer } from "three";

	type Props = {
		onRendererResize: (renderer: WebGLRenderer) => void;
		onRendererReady: (renderer: WebGLRenderer) => (() => void) | void;
		rendererParams: Omit<WebGLRendererParameters, "canvas">;
	};

	let {
		children,
		onRendererReady,
		onRendererResize,
		rendererParams = {},
		...props
	}: HTMLCanvasAttributes & Partial<Props> = $props();

	let clientWidth = $state(1);
	let clientHeight = $state(1);
</script>

<canvas
	bind:clientWidth
	bind:clientHeight
	{...props}
	{@attach (canvas) => {
		const renderer = new WebGLRenderer({
			canvas,
			...rendererParams,
		});

		$effect(() => {
			const cleanup = onRendererReady?.(renderer);
			return cleanup;
		});

		$effect(() => {
			renderer.setSize(clientWidth, clientHeight, false);
			onRendererResize?.(renderer);
		});

		return () => {
			renderer.dispose();
		};
	}}
>
	{@render children?.()}
</canvas>
