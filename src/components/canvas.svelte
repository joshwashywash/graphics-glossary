<script lang="ts">
	import type { HTMLCanvasAttributes } from "svelte/elements";
	import type { WebGLRendererParameters } from "three";
	import { WebGLRenderer } from "three";

	type Props = {
		loop: (renderer: WebGLRenderer, time: number) => void;
		onRendererResize: (renderer: WebGLRenderer) => void;
		onRendererReady: (renderer: WebGLRenderer) => (() => void) | void;
		rendererParams: Omit<WebGLRendererParameters, "canvas">;
	};

	let {
		children,
		loop,
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
			return onRendererReady?.(renderer);
		});

		$effect(() => {
			renderer.setSize(clientWidth, clientHeight, false);
			onRendererResize?.(renderer);
		});

		$effect(() => {
			if (loop === undefined) return;

			renderer.setAnimationLoop((time) => {
				loop(renderer, time);
			});

			return () => {
				renderer.setAnimationLoop(null);
			};
		});

		return () => {
			renderer.dispose();
		};
	}}
>
	{@render children?.()}
</canvas>
