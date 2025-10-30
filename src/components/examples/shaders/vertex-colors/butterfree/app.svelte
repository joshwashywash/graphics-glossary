<script
	module
	lang="ts"
>
	const loader = new TextureLoader();
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		Mesh,
		MeshBasicMaterial,
		OrthographicCamera,
		PlaneGeometry,
		SRGBColorSpace,
		Scene,
		TextureLoader,
		WebGLRenderer,
	} from "three";

	const canvasSize = new Size();

	const geometry = new PlaneGeometry();

	const colors = geometry.getAttribute("position").clone();

	const bottomRight = 2;

	for (let i = 0; i < bottomRight; i += 1) {
		colors.setXYZ(i, 1, 1, 1);
	}

	colors.setXYZ(bottomRight, 0, 0, 0);

	for (let i = bottomRight + 1; i < colors.count; i += 1) {
		colors.setXYZ(i, 1, 1, 1);
	}

	geometry.setAttribute("color", colors);

	const material = new MeshBasicMaterial();

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	onCleanup(() => {
		geometry.dispose();
		material.dispose();
	});

	const camera = new OrthographicCamera();
	camera.translateZ(1);

	let useVertexColors = $state(true);
	let useTexture = $state(true);

	const texture = loader
		.loadAsync("/textures/pokemon-snap-butterfree-wings.png")
		.then((texture) => {
			texture.generateMipmaps = false;
			texture.colorSpace = SRGBColorSpace;
			texture.repeat.set(0.5, 1);
			texture.offset.set(0.5, 0);
			return texture;
		});

	const map = $derived(useTexture ? await texture : null);
</script>

<Example>
	{#snippet pane()}
		<details open>
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
		class="w-full aspect-square"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				material.map = map;
				material.needsUpdate = true;
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

			return () => {
				renderer.dispose();
			};
		}}
	>
	</canvas>
</Example>
