<script lang="ts">
	import createColorAttribute from "./createColorAttribute";
	import renderer from "@utils/attachments/renderer.svelte";
	import type { Setup } from "@utils/attachments/renderer.svelte";
	import {
		BoxGeometry,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
	} from "three";

	const geometry = new BoxGeometry();
	const positionAttribute = geometry.getAttribute("position");

	// the default box geometry positions range from -0.5 -> 0.5
	// `f` remaps this to 0 -> 1
	const f = (n: number): number => 0.5 + n;
	const colorAttribute = createColorAttribute(positionAttribute, {
		x: f,
		y: f,
		z: f,
	});

	geometry.setAttribute("color", colorAttribute);

	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	const mesh = new Mesh(geometry, material);
	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 3);
	camera.lookAt(mesh.position);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			material.dispose();
			geometry.dispose();
		};
	});

	const angleY = (1 / 256) * Math.PI;
	const angleZ = angleY / 3;

	const setup: Setup = (renderer) => {
		const width = renderer.domElement.clientWidth;
		const height = 0.5 * width;

		const aspect = width / height;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);

		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
			mesh.rotateY(angleY).rotateZ(angleZ);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<canvas
	class="w-full"
	{@attach renderer(setup)}
>
</canvas>
