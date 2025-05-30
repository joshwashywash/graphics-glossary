<script lang="ts">
	import Size from "@classes/Size.svelte";
	import createColorAttribute from "./createColorAttribute";
	import renderer from "@attachments/renderer.svelte";
	import type { Setup } from "@attachments/renderer.svelte";
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

	const size = new Size();

	$effect(() => {
		camera.aspect = size.aspect;
		camera.updateProjectionMatrix();
	});

	const setup: Setup = (renderer) => {
		$effect(() => {
			renderer.setSize(size.width, size.height);
		});

		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
			mesh.rotateY(angleY).rotateZ(angleZ);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div bind:clientWidth={size.width}>
	<canvas {@attach renderer(setup)}></canvas>
</div>
