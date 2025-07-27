<script lang="ts">
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		SphereGeometry,
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let {
		autoRotate = true,
		flatShading = true,
		canvasWidth = 1,
		canvasHeight = 1,
		aspect = canvasWidth / canvasHeight,
	} = $props();

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 3);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const controls = new OrbitControls(camera);

	const geometry = new SphereGeometry(1, 16, 8);
	const material = new MeshNormalMaterial();
	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			material.dispose();
			geometry.dispose();
		};
	});

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	let loop: (() => void) | null = null;
</script>

<canvas
	{@attach (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		$effect(() => {
			renderer.setSize(canvasWidth, canvasHeight);
		});

		$effect(() => {
			renderer.setPixelRatio(pixelRatio);
		});

		controls.connect(renderer.domElement);

		const render = () => {
			renderer.render(scene, camera);
		};

		controls.addEventListener("change", render);

		$effect(() => {
			material.flatShading = flatShading;
			material.needsUpdate = true;
			if (loop === null) {
				render();
			}
		});

		$effect(() => {
			controls.autoRotate = autoRotate;
			if (controls.autoRotate) {
				renderer.setAnimationLoop(
					(loop = () => {
						controls.update();
					}),
				);
				return () => {
					renderer.setAnimationLoop((loop = null));
				};
			}
		});

		return () => {
			controls.removeEventListener("change", render);
			controls.disconnect();
			renderer.dispose();
		};
	}}
>
</canvas>
