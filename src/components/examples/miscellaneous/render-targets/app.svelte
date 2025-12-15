<script
	lang="ts"
	module
>
	const hdrLoader = new HDRLoader();
	const axis = new Vector3(1, 0, 1).normalize();
	const backgroundBlurriness = 0.1;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

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
		WebGPURenderer,
	} from "three/webgpu";

	const hdr = hdrLoader
		.loadAsync("/hdrs/university_workshop_1k.hdr")
		.then((hdr) => {
			hdr.mapping = EquirectangularReflectionMapping;
			return hdr;
		});

	const geometry = new PlaneGeometry();
	const target = new RenderTarget();
	const material = new MeshBasicMaterial({
		map: target.texture,
		side: DoubleSide,
	});

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera().translateOnAxis(axis, 2);
	camera.lookAt(scene.position);

	const controls = new OrbitControls(camera);

	useCleanup(() => {
		geometry.dispose();
		material.dispose();
		target.dispose();
	});

	const canvasSize = new Size();
</script>

<canvas
	class="example-canvas"
	bind:clientWidth={canvasSize.width}
	bind:clientHeight={canvasSize.height}
	{@attach (canvas) => {
		const renderer = new WebGPURenderer({
			antialias: true,
			canvas,
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

		controls.connect(renderer.domElement);

		const promise = Promise.all([hdr, renderer.init()]).then(
			([hdr, renderer]) => {
				scene.background = hdr;
				scene.environment = hdr;
				render();

				return $effect.root(() => {
					$effect(() => {
						target.setSize(canvasSize.width, canvasSize.height);
						renderer.setSize(canvasSize.width, canvasSize.height, false);

						const aspect = canvasSize.width / canvasSize.height;
						updateCameraAspect(camera, aspect);

						render();
					});

					controls.addEventListener("change", render);
					return () => {
						controls.removeEventListener("change", render);
					};
				});
			},
		);

		return () => {
			controls.disconnect();
			promise.then((cleanup) => cleanup());
			renderer.dispose();
		};
	}}
>
</canvas>
