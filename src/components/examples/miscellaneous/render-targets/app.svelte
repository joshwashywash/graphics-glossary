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
	import { Size } from "@classes/size.svelte";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resizeRenderer } from "@functions/resizeRenderer";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";
	import { useDisposable } from "@functions/useDisposable.svelte";

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
		Vector3,
	} from "three/webgpu";

	const scene = new Scene();
	const hdr = await hdrLoader.loadAsync("/hdrs/university_workshop_1k.hdr");
	hdr.mapping = EquirectangularReflectionMapping;
	scene.background = hdr;
	scene.environment = hdr;

	const geometry = useDisposable(PlaneGeometry);
	const target = useDisposable(RenderTarget);
	const material = useDisposable(MeshBasicMaterial, {
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

	$effect(() => {
		updateCameraAspect(camera, canvasSize.width / canvasSize.height);
	});

	const canvasSize = new Size();
</script>

<canvas
	class="example-canvas"
	bind:clientWidth={canvasSize.width}
	bind:clientHeight={canvasSize.height}
	{@attach (canvas) => {
		const renderer = createRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			resizeRenderer(renderer, canvasSize.width, canvasSize.height);
		});

		const render = () => {
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

		$effect(() => {
			target.setSize(canvas.width, canvas.height);
		});

		renderer.setAnimationLoop(render);

		useDisposable(OrbitControls, camera, renderer.domElement);

		return () => {
			renderer.setAnimationLoop(null);
		};
	}}
>
</canvas>
