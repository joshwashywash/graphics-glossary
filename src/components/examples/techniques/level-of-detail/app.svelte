<script lang="ts">
	import { createLOD } from "./createLOD";

	import { Size } from "@classes/Size.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

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

	const canvasSize = new Size();

	$effect(() => {
		camera.aspect = canvasSize.aspect;
		camera.updateProjectionMatrix();
	});

	const speed = 1 / 1000;
</script>

<div bind:clientWidth={canvasSize.width}>
	<canvas
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				canvas,
			});

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
			});

			renderer.setAnimationLoop((time) => {
				const t = 0.5 * (1 + Math.sin(time * speed));
				camera.position.z = lerp(
					maxDistance + 2,
					lod.position.z + radius + 2,
					t,
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
</div>
