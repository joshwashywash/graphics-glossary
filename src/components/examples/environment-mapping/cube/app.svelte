<script
	module
	lang="ts"
>
	const loader = new CubeTextureLoader().setPath("/cubemaps/Lycksele/");
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resizeRenderer } from "@functions/resizeRenderer";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import {
		CubeTextureLoader,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		SphereGeometry,
	} from "three/webgpu";

	const canvasSize = new Size();

	const scene = new Scene();

	const texture = await loader.loadAsync([
		"posx.jpg",
		"negx.jpg",
		"posy.jpg",
		"negy.jpg",
		"posz.jpg",
		"negz.jpg",
	]);
	useCleanup(() => {
		texture.dispose();
	});

	scene.background = texture;

	const geometry = useDisposable(SphereGeometry);
	const material = useDisposable(MeshBasicMaterial, {
		envMap: texture,
	});
	const mesh = new Mesh(geometry, material);

	scene.add(mesh);

	const camera = new PerspectiveCamera().translateZ(5);

	$effect(() => {
		updateCameraAspect(camera, canvasSize.width / canvasSize.height);
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

		const controls = useDisposable(OrbitControls, camera, renderer.domElement);
		controls.autoRotate = true;

		$effect(() => {
			resizeRenderer(renderer, canvasSize.width, canvasSize.height);
		});

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	}}
>
</canvas>
