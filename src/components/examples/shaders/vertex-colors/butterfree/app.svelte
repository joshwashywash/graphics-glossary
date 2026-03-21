<script
	module
	lang="ts"
>
	const loader = new TextureLoader();
</script>

<script lang="ts">
	import butterfreeImageMetadata from "@assets/pokemon-snap-butterfree-wings.png";

	import { FullScreenTriangleGeometry } from "@classes/FullScreenTriangleGeometry";
	import { Size } from "@classes/size.svelte";

	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createFullScreenOrthographicCamera } from "@functions/createFullScreenCamera";
	import { createRenderer } from "@functions/createRenderer.svelte";
	import { useCleanup } from "@functions/useCleanup.svelte";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import {
		CanvasTexture,
		Float32BufferAttribute,
		Mesh,
		MeshBasicMaterial,
		SRGBColorSpace,
		TextureLoader,
	} from "three/webgpu";
	import { Pane } from "tweakpane";

	const oss = new OffscreenCanvas(1, 1);
	const ossContext = oss.getContext("2d");
	if (ossContext === null) {
		throw new Error("texture context is null");
	}

	ossContext.fillStyle = "#ffffff";
	ossContext.fillRect(0, 0, oss.width, oss.height);
	const whiteTexture = useDisposable(CanvasTexture, oss);

	const geometry = useDisposable(FullScreenTriangleGeometry).setAttribute(
		"color",
		// white, black, white
		new Float32BufferAttribute([1, 1, 1, 0, 0, 0, 1, 1, 1], 3),
	);

	const butterfreeWingTexture = await loader.loadAsync(
		butterfreeImageMetadata.src,
	);

	useCleanup(() => {
		butterfreeWingTexture.dispose();
	});
	butterfreeWingTexture.generateMipmaps = false;
	butterfreeWingTexture.colorSpace = SRGBColorSpace;
	butterfreeWingTexture.repeat.set(0.5, 1);
	butterfreeWingTexture.offset.set(0.5, 0);

	const material = useDisposable(MeshBasicMaterial, {
		map: butterfreeWingTexture,
	});

	const mesh = new Mesh(geometry, material);

	const camera = createFullScreenOrthographicCamera();

	const canvasSize = new Size();
</script>

<svelte:boundary onerror={console.trace}>
	{#snippet failed(error)}
		{error}
	{/snippet}
</svelte:boundary>

<div class="relative">
	<PaneContainer
		class="absolute top-2 right-2"
		{@attach (container) => {
			const pane = useDisposable(Pane, {
				container,
				expanded: false,
				title: "controls",
			});

			pane.addBinding(
				{
					get useVertexColors() {
						return material.vertexColors;
					},
					set useVertexColors(value) {
						material.vertexColors = value;
						material.needsUpdate = true;
					},
				},
				"useVertexColors",
				{
					label: "use vertex colors",
				},
			);
			pane
				.addBinding(
					{
						useTexture: true,
					},
					"useTexture",
					{
						label: "use texture",
					},
				)
				.on("change", (e) => {
					material.map = e.value ? butterfreeWingTexture : whiteTexture;
				});
		}}
	/>

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = createRenderer(
				{
					antialias: true,
					canvas,
				},
				() => canvasSize.width,
				() => canvasSize.height,
			);

			renderer.setAnimationLoop(() => {
				renderer.render(mesh, camera);
			});
		}}
	>
	</canvas>
</div>
