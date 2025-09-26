<script
	module
	lang="ts"
>
	const rotationAmount = (1 / 120) * Math.PI;

	const axis = new Vector3(1, 1, -1).normalize();
</script>

<script lang="ts">
	import { VertexColorsBoxGeometry } from "./VertexColorsBoxGeometry";

	import Canvas from "@components/canvas.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		Vector3,
		WebGLRenderer,
	} from "three";
	import type { WebGLRendererParameters } from "three";

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

	const rendererParams: WebGLRendererParameters = {
		antialias: true,
	};

	const onRendererReady = (renderer: WebGLRenderer) => {
		renderer.setAnimationLoop(() => {
			mesh.rotateOnAxis(axis, rotationAmount);
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};

	const onRendererResize = (renderer: WebGLRenderer) => {
		const { clientWidth, clientHeight } = renderer.domElement;
		camera.aspect = clientWidth / clientHeight;
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
	};
</script>

<Canvas
	class="w-full aspect-square"
	{onRendererReady}
	{onRendererResize}
	{rendererParams}
/>
