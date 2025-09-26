<script lang="ts">
	import Canvas from "@components/canvas.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
		WebGLRenderer,
	} from "three";
	import type { WebGLRendererParameters } from "three";

	const distance = 5;
	const halfDistance = 0.5 * distance;

	const geometry = new TorusKnotGeometry();

	const material = new MeshNormalMaterial();
	const flatShadingMaterial = material.clone();
	flatShadingMaterial.flatShading = true;

	onCleanup(() => {
		material.dispose();
		flatShadingMaterial.dispose();
		geometry.dispose();
	});

	const mesh = new Mesh(geometry, material);
	mesh.translateX(-1 * halfDistance);

	const flatShadingMesh = new Mesh(geometry, flatShadingMaterial);
	flatShadingMesh.translateX(halfDistance);

	const meshes = [mesh, flatShadingMesh];

	const scene = new Scene().add(...meshes);

	const camera = new PerspectiveCamera();
	camera.translateZ(10);

	const rotationAmount = (1 / 180) * Math.PI;

	const loop = (renderer: WebGLRenderer) => {
		for (const mesh of meshes) {
			mesh.rotateY(rotationAmount);
		}
		renderer.render(scene, camera);
	};

	const onRendererResize = (renderer: WebGLRenderer) => {
		const { clientWidth, clientHeight } = renderer.domElement;
		camera.aspect = clientWidth / clientHeight;
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
	};

	const rendererParams: WebGLRendererParameters = {
		antialias: true,
	};
</script>

<Canvas
	class="w-full aspect-square"
	{loop}
	{onRendererResize}
	{rendererParams}
/>
