<script
	lang="ts"
	module
>
	const rotationAmount = (1 / 180) * Math.PI;
</script>

<script lang="ts">
	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
		WebGLRenderer,
	} from "three";

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

		renderer.setAnimationLoop(() => {
			for (const mesh of meshes) {
				mesh.rotateY(rotationAmount);
			}
			render();
		});

		return () => {
			renderer.setAnimationLoop(null);
			renderer.dispose();
		};
	}}
>
</canvas>
