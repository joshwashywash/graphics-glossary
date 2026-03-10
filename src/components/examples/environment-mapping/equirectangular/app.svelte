<script
	module
	lang="ts"
>
	const loader = new TextureLoader();
	const CAMERA_TRANSLATION_AMOUNT = 1;

	const textureUrl = "/equirect/suburban_garden.png";
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { equirectUV, texture } from "three/tsl";
	import { PerspectiveCamera, Scene, TextureLoader } from "three/webgpu";

	const equirectTexture = await loader.loadAsync(
		textureUrl
	);
	useCleanup(() => {
		equirectTexture.dispose();
	});

	const scene = new Scene();
	scene.backgroundNode = texture(equirectTexture, equirectUV(), 0);

	const camera = new PerspectiveCamera().translateZ(CAMERA_TRANSLATION_AMOUNT);

	const canvasSize = new Size();

	$effect(() => {
		updateCameraAspect(camera, canvasSize.ratio);
	});
</script>

<canvas
	bind:clientWidth={canvasSize.width}
	bind:clientHeight={canvasSize.height}
	class="example-canvas"
	{@attach (canvas) => {
		const renderer = createRenderer(
			{
				antialias: true,
				canvas,
			},
			() => canvasSize.width,
			() => canvasSize.height,
		);

		equirectTexture.colorSpace = renderer.currentColorSpace;

		const controls = useDisposable(OrbitControls, camera, renderer.domElement);
		controls.autoRotate = true;

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});
	}}
>
</canvas>
