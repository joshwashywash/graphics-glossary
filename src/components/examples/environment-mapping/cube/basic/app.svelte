<script
	module
	lang="ts"
>
	const loader = new CubeTextureLoader().setPath("/cubemaps/Lycksele/");
	const files = [
		"posx.jpg",
		"negx.jpg",
		"posy.jpg",
		"negy.jpg",
		"posz.jpg",
		"negz.jpg",
	] as const;

	const CAMERA_TRANSLATION_AMOUNT = 5;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resizeRenderer } from "@functions/resizeRenderer.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import {
		CubeTextureLoader,
		IcosahedronGeometry,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
	} from "three/webgpu";

	const scene = new Scene();

	const texture = await loader.loadAsync(files);
	useCleanup(() => {
		texture.dispose();
	});

	scene.background = texture;

	const geometry = useDisposable(IcosahedronGeometry, 1, 0);
	const material = useDisposable(MeshBasicMaterial, {
		envMap: texture,
	});
	const mesh = new Mesh(geometry, material);

	scene.add(mesh);

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
		const renderer = createRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			resizeRenderer(renderer, canvasSize.width, canvasSize.height);
		});

		const controls = useDisposable(OrbitControls, camera, renderer.domElement);
		controls.autoRotate = true;

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});
	}}
>
</canvas>
