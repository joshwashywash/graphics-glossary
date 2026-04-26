<script
	module
	lang="ts"
>
	const loader = new CubeTextureLoader().setPath(
		import.meta.env.BASE_URL + "/cubemaps/Lycksele/",
	);
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
	import { controls } from "@attachments/controls";

	import { createDisposed } from "@functions/createDisposed.svelte";
	import { onCleanup } from "@functions/onCleanup.svelte";
	import { resize } from "@functions/resize";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import {
		CubeTextureLoader,
		IcosahedronGeometry,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		WebGPURenderer,
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

	const orbit = new OrbitControls(camera);
	orbit.autoRotate = true;
</script>

<canvas
	{@attach controls(orbit)}
	{@attach (canvas) => {
		const renderer = new WebGPURenderer({
			antialias: true,
			canvas,
		});

		const promise = renderer.setAnimationLoop(() => {
			if (resize(renderer)) {
				const aspect = canvas.clientWidth / canvas.clientHeight;
				setCameraAspect(camera, aspect);
			}

			orbit.update();
			renderer.render(scene, camera);
		});

		return () => {
			promise
				.then(() => {
					return renderer.setAnimationLoop(null);
				})
				.then(() => {
					renderer.dispose();
				});
		};
	}}
>
</canvas>
