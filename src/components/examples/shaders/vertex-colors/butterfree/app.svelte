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
	import { useCleanup } from "@functions/useCleanup.svelte";

	import {
		CanvasTexture,
		Float32BufferAttribute,
		Mesh,
		MeshBasicMaterial,
		SRGBColorSpace,
		TextureLoader,
		WebGPURenderer,
	} from "three/webgpu";

	const oss = new OffscreenCanvas(1, 1);
	const ossContext = oss.getContext("2d");
	if (ossContext === null) {
		throw new Error("texture context is null");
	}

	ossContext.fillStyle = "#ffffff";
	ossContext.fillRect(0, 0, oss.width, oss.height);
	const whiteTexture = new CanvasTexture(oss);

	const canvasSize = new Size();

	const geometry = new FullScreenTriangleGeometry().setAttribute(
		"color",
		// white, black, white
		new Float32BufferAttribute([1, 1, 1, 0, 0, 0, 1, 1, 1], 3),
	);

	const material = new MeshBasicMaterial();

	const mesh = new Mesh(geometry, material);

	const camera = createFullScreenCamera();

	let useVertexColors = $state(true);
	let useTexture = $state(true);

	const butterfreeWingTexture = loader
		.loadAsync(butterfreeImageMetadata.src)
		.then((texture) => {
			texture.generateMipmaps = false;
			texture.colorSpace = SRGBColorSpace;
			texture.repeat.set(0.5, 1);
			texture.offset.set(0.5, 0);
			return texture;
		});

	useCleanup(() => {
		geometry.dispose();
		material.dispose();
		butterfreeWingTexture.then((t) => t.dispose());
		whiteTexture.dispose();
	});

	const map = $derived(useTexture ? await butterfreeWingTexture : whiteTexture);

	$effect(() => {
		material.map = map;
	});
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
					bind:checked={
						() => useVertexColors,
						(value) => {
							useVertexColors = material.vertexColors = value;
							material.needsUpdate = true;
						}
					}
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
				const renderer = new WebGPURenderer({
					antialias: true,
					canvas,
				});

				$effect(() => {
					renderer.setSize(canvasSize.width, canvasSize.height, false);
				});

				renderer.setAnimationLoop(() => {
					renderer.render(mesh, camera);
				});

				return () => {
					renderer.setAnimationLoop(null);
					renderer.dispose();
				};
			}}
		>
		</canvas>
	</div>
</svelte:boundary>
