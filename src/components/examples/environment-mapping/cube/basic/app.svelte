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
	import { createDisposed } from "@functions/createDisposed.svelte";
	import { createRenderer } from "@functions/createRenderer.svelte";
	import { onCleanup } from "@functions/onCleanup.svelte";
	import { resize } from "@functions/resize.svelte";
	import { setCameraAspect } from "@functions/setCameraAspect";

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
	onCleanup(() => {
		texture.dispose();
	});

	scene.background = texture;

	const geometry = createDisposed(IcosahedronGeometry, 1, 0);
	const material = createDisposed(MeshBasicMaterial, {
		envMap: texture,
	});
	const mesh = new Mesh(geometry, material);

	scene.add(mesh);

	const camera = new PerspectiveCamera().translateZ(CAMERA_TRANSLATION_AMOUNT);
</script>

<canvas
	{@attach (canvas) => {
		const renderer = createRenderer({
			antialias: true,
			canvas,
		});

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
