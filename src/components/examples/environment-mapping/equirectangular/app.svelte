<script
	module
	lang="ts"
>
	const loader = new TextureLoader();
	const CAMERA_TRANSLATION_AMOUNT = 1;

	const textureUrl = "/equirect/suburban_garden.png";
</script>

<script lang="ts">
	import { createDisposed } from "@functions/createDisposed.svelte";
	import { createRenderer } from "@functions/createRenderer.svelte";
	import { onCleanup } from "@functions/onCleanup.svelte";
	import { resize } from "@functions/resize.svelte";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { equirectUV, texture } from "three/tsl";
	import { PerspectiveCamera, Scene, TextureLoader } from "three/webgpu";

	const equirectTexture = await loader.loadAsync(textureUrl);
	onCleanup(() => {
		equirectTexture.dispose();
	});

	const scene = new Scene();
	scene.backgroundNode = texture(equirectTexture, equirectUV(), 0);

	const camera = new PerspectiveCamera().translateZ(CAMERA_TRANSLATION_AMOUNT);
</script>

<canvas
	class="aspect-video"
	{@attach (canvas) => {
		const renderer = createRenderer({
			antialias: true,
			canvas,
		});

		equirectTexture.colorSpace = renderer.currentColorSpace;

		const controls = createDisposed(OrbitControls, camera, renderer.domElement);
		controls.autoRotate = true;

		renderer.setAnimationLoop(() => {
			const canvas = renderer.domElement;
			if (resize(renderer)) {
				const aspect = canvas.clientWidth / canvas.clientHeight;
				setCameraAspect(camera, aspect);
			}

			controls.update();
			renderer.render(scene, camera);
		});
	}}
>
</canvas>
