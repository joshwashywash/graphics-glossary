<script
	module
	lang="ts"
>
	const loader = new TextureLoader();
	const CAMERA_TRANSLATION_AMOUNT = 1;

	const textureUrl = import.meta.env.BASE_URL + "/equirect/suburban_garden.png";
</script>

<script lang="ts">
	import { controls } from "@attachments/controls";

	import { onCleanup } from "@functions/onCleanup.svelte";
	import { resize } from "@functions/resize";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { equirectUV, texture } from "three/tsl";
	import {
		PerspectiveCamera,
		Scene,
		TextureLoader,
		WebGPURenderer,
	} from "three/webgpu";

	const equirectTexture = await loader.loadAsync(textureUrl);
	onCleanup(() => {
		equirectTexture.dispose();
	});

	const scene = new Scene();
	scene.backgroundNode = texture(equirectTexture, equirectUV(), 0);

	const camera = new PerspectiveCamera().translateZ(CAMERA_TRANSLATION_AMOUNT);

	const orbit = new OrbitControls(camera);
	orbit.autoRotate = true;
</script>

<canvas
	class="aspect-square"
	{@attach controls(orbit)}
	{@attach (canvas) => {
		const renderer = new WebGPURenderer({
			antialias: true,
			canvas,
		});

		equirectTexture.colorSpace = renderer.currentColorSpace;

		const promise = renderer.setAnimationLoop(() => {
			if (resize(renderer)) {
				const aspect = canvas.clientWidth / canvas.clientHeight;
				setCameraAspect(camera, aspect);
			}

			orbit.update();
			renderer.render(scene, camera);
		});

		return () => {
			promise.then(() => {
				renderer.dispose();
			});
		};
	}}
>
</canvas>
