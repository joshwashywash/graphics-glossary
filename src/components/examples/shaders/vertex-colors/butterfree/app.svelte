<script
	module
	lang="ts"
>
	const loader = new TextureLoader();
</script>

<script lang="ts">
	import { createRendererAttachment } from "@attachments/createRendererAttachment.svelte";

	import { FullScreenTriangleGeometry } from "@classes/FullScreenTriangleGeometry";
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { createFullScreenCamera } from "@functions/createFullScreenCamera";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import {
		CanvasTexture,
		Mesh,
		MeshBasicMaterial,
		SRGBColorSpace,
		Scene,
		TextureLoader,
	} from "three/webgpu";

	const canvasSize = new Size();

	const geometry = new FullScreenTriangleGeometry();

	const colors = geometry.getAttribute("position").clone();

	const bottomLeft = colors.count - 2;

	for (let i = 0; i < bottomLeft; i += 1) {
		colors.setXYZ(i, 1, 1, 1);
	}

	colors.setXYZ(bottomLeft, 0, 0, 0);

	for (let i = bottomLeft + 1; i < colors.count; i += 1) {
		colors.setXYZ(i, 1, 1, 1);
	}

	geometry.setAttribute("color", colors);

	const oss = new OffscreenCanvas(1, 1);
	const ossContext = oss.getContext("2d");
	if (ossContext === null) {
		throw new Error("texture context is null");
	}

	ossContext.fillStyle = "#ffffff";
	ossContext.fillRect(0, 0, oss.width, oss.height);
	const whiteTexture = new CanvasTexture(oss);

	const material = new MeshBasicMaterial({
		transparent: true,
	});

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const camera = createFullScreenCamera();

	let useVertexColors = $state(true);
	let useTexture = $state(true);

	const texture = await loader
		.loadAsync("/textures/pokemon-snap-butterfree-wings.png")
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
		texture.dispose();
		whiteTexture.dispose();
	});

	const map = $derived(useTexture ? texture : whiteTexture);

	const attachment = createRendererAttachment((renderer) => {
		const render = () => {
			renderer.render(scene, camera);
		};

		$effect(() => {
			material.map = map;
			render();
		});

		$effect(() => {
			renderer.setSize(canvasSize.width, canvasSize.height, false);
			render();
		});

		$effect(() => {
			material.vertexColors = useVertexColors;
			material.needsUpdate = true;
			render();
		});
	});
</script>

<svelte:boundary>
	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
	<Example>
		{#snippet pane()}
			<details>
				<summary>butterfree wing</summary>
				<Label>
					use vertex colors
					<input
						type="checkbox"
						bind:checked={useVertexColors}
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
		{/snippet}

		<canvas
			class="example-canvas"
			bind:clientWidth={canvasSize.width}
			bind:clientHeight={canvasSize.height}
			{@attach attachment}
		>
		</canvas>
	</Example>
</svelte:boundary>
