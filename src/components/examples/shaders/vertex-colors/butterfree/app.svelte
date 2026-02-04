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

	import { Label } from "@components/controls";

	import { createFullScreenCamera } from "@functions/createFullScreenCamera";
	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resizeRenderer } from "@functions/resizeRenderer";
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

	const oss = new OffscreenCanvas(1, 1);
	const ossContext = oss.getContext("2d");
	if (ossContext === null) {
		throw new Error("texture context is null");
	}

	ossContext.fillStyle = "#ffffff";
	ossContext.fillRect(0, 0, oss.width, oss.height);
	const whiteTexture = useDisposable(CanvasTexture, oss);

	const canvasSize = new Size();

	const geometry = useDisposable(FullScreenTriangleGeometry).setAttribute(
		"color",
		// white, black, white
		new Float32BufferAttribute([1, 1, 1, 0, 0, 0, 1, 1, 1], 3),
	);

	const material = useDisposable(MeshBasicMaterial);

	const mesh = new Mesh(geometry, material);

	const camera = createFullScreenCamera();

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

	let useTexture = $state(true);

	$effect(() => {
		material.map = useTexture ? butterfreeWingTexture : whiteTexture;
	});

	let useVertexColors = $state(true);
	const getUseVertexColors = () => useVertexColors;
	const setUseVertexColors = (value: boolean) => {
		useVertexColors = material.vertexColors = value;
		material.needsUpdate = true;
	};
</script>

<svelte:boundary>
	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
	<div class="relative">
		<details class="example-pane">
			<summary>butterfree wing</summary>
			<Label>
				use vertex colors
				<input
					type="checkbox"
					bind:checked={getUseVertexColors, setUseVertexColors}
				/>
			</Label>
			<Label>
				use texture
				<input
					type="checkbox"
					bind:checked={useTexture}
				/>
			</Label>
		</details>

		<canvas
			class="example-canvas"
			bind:clientWidth={canvasSize.width}
			bind:clientHeight={canvasSize.height}
			{@attach (canvas) => {
				const renderer = createRenderer({
					antialias: true,
					canvas,
				});

				$effect(() => {
					resizeRenderer(renderer, canvasSize.width, canvasSize.height);
				});

				renderer.setAnimationLoop(() => {
					renderer.render(mesh, camera);
				});

				return () => {
					renderer.setAnimationLoop(null);
				};
			}}
		>
		</canvas>
	</div>
</svelte:boundary>
