<script
	module
	lang="ts"
>
	const rotationAmount = (1 / 120) * Math.PI;

	const axis = new Vector3(1, 1, -1).normalize();
</script>

<script lang="ts">
	import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";

	import { Size } from "@classes/size.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		Vector3,
		WebGLRenderer,
	} from "three";

	const geometry = new VertexColorsBoxGeometry();
	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	onCleanup(() => {
		geometry.dispose();
		material.dispose();
	});

	const camera = new PerspectiveCamera();
	camera.translateZ(3);

	const canvasSize = new Size();
</script>

<canvas
	class="w-full aspect-square"
	bind:clientWidth={canvasSize.width}
	bind:clientHeight={canvasSize.height}
	{@attach (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		const render = () => {
			renderer.render(scene, camera);
		};

		$effect(() => {
			renderer.setSize(canvasSize.width, canvasSize.height, false);
			render();
		});

		$effect(() => {
			camera.aspect = canvasSize.aspect;
			camera.updateProjectionMatrix();
			render();
		});

		renderer.setAnimationLoop(() => {
			mesh.rotateOnAxis(axis, rotationAmount);
			render();
		});

		return () => {
			renderer.setAnimationLoop(null);
			renderer.dispose();
		};
	}}
>
</canvas>
