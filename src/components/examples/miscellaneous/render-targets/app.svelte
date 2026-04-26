<script
	lang="ts"
	module
>
	const hdrLoader = new HDRLoader();
	const cameraTranslationAxis = new Vector3(1, 0, 1).normalize();
	const cameraTranslationAmount = 2;
	const backgroundBlurriness = 0.1;
</script>

<script lang="ts">
	import { controls } from "@attachments/controls";

	import { createDisposed } from "@functions/createDisposed.svelte";
	import { resize } from "@functions/resize";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
	import {
		DoubleSide,
		EquirectangularReflectionMapping,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		PlaneGeometry,
		RenderTarget,
		Scene,
		Vector2,
		Vector3,
		WebGPURenderer,
	} from "three/webgpu";

	const scene = new Scene();
	const hdr = await hdrLoader.loadAsync(
		import.meta.env.BASE_URL + "/hdrs/university_workshop_1k.hdr",
	);
	hdr.mapping = EquirectangularReflectionMapping;
	scene.background = hdr;
	scene.environment = hdr;

	const geometry = createDisposed(PlaneGeometry);
	const target = createDisposed(RenderTarget);
	const material = createDisposed(MeshBasicMaterial, {
		map: target.texture,
		side: DoubleSide,
	});

	const mesh = new Mesh(geometry, material);
	scene.add(mesh);

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);
	camera.lookAt(scene.position);

	const orbit = new OrbitControls(camera);

	const size = new Vector2();
</script>

<canvas
	class="aspect-square"
	{@attach controls(orbit)}
	{@attach (canvas) => {
		const renderer = new WebGPURenderer({
			antialias: true,
			canvas,
		});

		const render = () => {
			if (resize(renderer)) {
				const aspect = canvas.clientWidth / canvas.clientHeight;
				setCameraAspect(camera, aspect);
				renderer.getSize(size);
				target.setSize(size.width, size.height);
			}

			mesh.visible = false;

			const last = renderer.getRenderTarget();

			renderer.setRenderTarget(target);
			renderer.render(scene, camera);

			mesh.visible = true;
			renderer.setRenderTarget(last);

			const lastBlurriness = scene.backgroundBlurriness;
			scene.backgroundBlurriness = backgroundBlurriness;

			renderer.render(scene, camera);

			scene.backgroundBlurriness = lastBlurriness;
		};

		const promise = renderer.setAnimationLoop(render);

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
