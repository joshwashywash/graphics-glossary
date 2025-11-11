<script
	lang="ts"
	module
>
	const speed = 1 / 1000;
</script>

<script lang="ts">
	import { createLOD } from "./createLOD";

	import { needsResize } from "@functions/needsResize";
	import { onCleanup } from "@functions/onCleanup.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";

	import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
	import { lerp } from "three/src/math/MathUtils.js";

	const maxDistance = 15;
	const minDistance = 3;
	const halfway = 0.5 * (maxDistance + minDistance);
	const distances = [maxDistance, halfway, minDistance];

	const radius = 1;
	const { lod, dispose: disposeLOD } = createLOD(distances, radius);

	const scene = new Scene().add(lod);

	onCleanup(disposeLOD);

	const camera = new PerspectiveCamera();
</script>

<canvas
	class="example-canvas"
	{@attach (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		renderer.setAnimationLoop((time) => {
			if (needsResize(renderer.domElement)) {
				const { clientWidth, clientHeight } = renderer.domElement;

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

		return () => {
			renderer.setAnimationLoop(null);
			renderer.dispose();
		};
	}}
>
</canvas>
