<script
	lang="ts"
	module
>
	const speed = 1 / 1000;

	const maxDistance = 15;
	const minDistance = 3;
	const halfway = 0.5 * (maxDistance + minDistance);

	const distances = [maxDistance, halfway, minDistance];

	const radius = 1;

	const cameraPositionZStart = 2 + maxDistance;
</script>

<script lang="ts">
	import { createLOD } from "./createLOD";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { lerp } from "three/src/math/MathUtils.js";
	import { PerspectiveCamera, WebGPURenderer } from "three/webgpu";

	const { lod, dispose: disposeLOD } = createLOD(distances, radius);

	useCleanup(disposeLOD);

	const cameraPositionZEnd = 2 + lod.position.z + radius;

	const camera = new PerspectiveCamera();
</script>

<canvas
	class="example-canvas"
	{@attach (canvas) => {
		const renderer = new WebGPURenderer({
			antialias: true,
			canvas,
		});

		renderer.setAnimationLoop((time) => {
			const { clientHeight, clientWidth, height, width } = renderer.domElement;
			if (clientHeight !== height || clientWidth !== width) {
				renderer.setSize(clientWidth, clientHeight, false);
				updateCameraAspect(camera, clientWidth / clientHeight);
			}

			time = 0.5 * (1 + Math.sin(time * speed));
			camera.position.z = lerp(cameraPositionZStart, cameraPositionZEnd, time);

			renderer.render(lod, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
			renderer.dispose();
		};
	}}
>
</canvas>
