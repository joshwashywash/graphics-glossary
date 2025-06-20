<script lang="ts">
	import createColorAttribute from "./createColorAttribute";

	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

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

	$effect(() => {
		return () => {
			material.dispose();
			geometry.dispose();
		};
	});

	const scene = new Scene();
	const addToScene = createAdd(() => scene);

	const mesh = new Mesh(geometry, material);
	addToScene(() => mesh);

	const size = new Size();

	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);
	camera.position.set(0, 0, 3);

	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const angleY = (1 / 256) * Math.PI;
	const angleZ = angleY / 3;
</script>

<div bind:clientWidth={size.width}>
	<canvas
		{@attach renderer(
			() => size.width,
			() => size.height,
			(renderer) => {
				renderer.setAnimationLoop(() => {
					renderer.render(scene, camera);
					mesh.rotateY(angleY).rotateZ(angleZ);
				});

				return () => {
					renderer.setAnimationLoop(null);
				};
			},
		)}
	>
	</canvas>
</div>
