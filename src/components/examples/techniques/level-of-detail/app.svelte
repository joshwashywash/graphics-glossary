<script
	lang="ts"
	module
>
	const speed = 1 / 1000;
</script>

<script lang="ts">
	import { createLOD } from "./createLOD";

	import Canvas from "@components/canvas.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import { PerspectiveCamera, Scene } from "three";
	import type { WebGLRenderer, WebGLRendererParameters } from "three";
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

	const onRendererResize = (renderer: WebGLRenderer) => {
		const { clientWidth, clientHeight } = renderer.domElement;
		camera.aspect = clientWidth / clientHeight;
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
	};

	const rendererParams: WebGLRendererParameters = {
		antialias: true,
	};

	const loop = (renderer: WebGLRenderer, time: number) => {
		const t = 0.5 * (1 + Math.sin(time * speed));
		camera.position.z = lerp(maxDistance + 2, lod.position.z + radius + 2, t);

		renderer.render(scene, camera);
	};
</script>

<Canvas
	class="w-full aspect-square"
	{loop}
	{onRendererResize}
	{rendererParams}
/>
