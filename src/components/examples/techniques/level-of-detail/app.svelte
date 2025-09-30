<script
	lang="ts"
	module
>
	const speed = 1 / 1000;
</script>

<script lang="ts">
	import { createLOD } from "./createLOD";

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

	let clientWidth = $state(1);
	let clientHeight = $state(1);

	const aspect = $derived(clientWidth / clientHeight);
</script>

<canvas
	class="w-full aspect-square"
	bind:clientWidth
	bind:clientHeight
	{@attach (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		const render = () => {
			renderer.render(scene, camera);
		};

		$effect(() => {
			renderer.setSize(clientWidth, clientHeight, false);
			render();
		});

		$effect(() => {
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
			render();
		});

		renderer.setAnimationLoop((time) => {
			time = 0.5 * (1 + Math.sin(time * speed));
			camera.position.z = lerp(
				maxDistance + 2,
				lod.position.z + radius + 2,
				time,
			);
			render();
		});

		return () => {
			renderer.setAnimationLoop(null);
			renderer.dispose();
		};
	}}
>
</canvas>
