<script lang="ts">
	import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

	let clientWidth = $state(1);
	let clientHeight = $state(1);

	const aspect = $derived(clientWidth / clientHeight);

	const scene = new Scene();

	const camera = new PerspectiveCamera();
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

		return () => {
			renderer.dispose();
		};
	}}
>
</canvas>
