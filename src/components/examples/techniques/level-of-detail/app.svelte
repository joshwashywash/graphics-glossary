<script
	lang="ts"
	module
>
	const speed = 1 / 1000;
</script>

<script lang="ts">
	import { createLOD } from "./createLOD";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { lerp } from "three/src/math/MathUtils.js";
	import { PerspectiveCamera, Scene, WebGPURenderer } from "three/webgpu";

	const maxDistance = 15;
	const minDistance = 3;
	const halfway = 0.5 * (maxDistance + minDistance);
	const distances = [maxDistance, halfway, minDistance];

	const radius = 1;
	const { lod, dispose: disposeLOD } = createLOD(distances, radius);

	const scene = new Scene().add(lod);

	useCleanup(disposeLOD);

	const camera = new PerspectiveCamera();
</script>

<canvas
	class="example-canvas"
	{@attach (canvas) => {
		const promise = new WebGPURenderer({
			antialias: true,
			canvas,
		})
			.init()
			.then((renderer) => {
				renderer.setAnimationLoop((time) => {
					const { clientHeight, clientWidth, height, width } =
						renderer.domElement;
					if (clientHeight !== height || clientWidth !== width) {
						renderer.setSize(clientWidth, clientHeight, false);
						updateCameraAspect(camera, clientWidth / clientHeight);
					}

					time = 0.5 * (1 + Math.sin(time * speed));
					camera.position.z = lerp(
						maxDistance + 2,
						lod.position.z + radius + 2,
						time,
					);

					renderer.render(scene, camera);
				});

				return renderer;
			});

		return () => {
			promise.then((renderer) => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			});
		};
	}}
>
</canvas>
