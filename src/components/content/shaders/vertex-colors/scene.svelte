<script lang="ts">
	import createColorAttribute from "./createColorAttribute";

	import { getSize } from "@contexts/size";
	import { getWithRenderer } from "@contexts/withRenderer";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import { BoxGeometry, Mesh, MeshBasicMaterial, Scene } from "three";

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

	const mesh = new Mesh(geometry, material);

	const scene = new Scene();

	const add = createAdd(() => scene);

	add(() => mesh);

	const size = getSize();

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 3);
	camera.lookAt(mesh.position);

	const angleY = (1 / 256) * Math.PI;
	const angleZ = angleY / 3;

	const withRenderer = getWithRenderer();

	withRenderer((renderer) => {
		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
			mesh.rotateY(angleY).rotateZ(angleZ);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	});
</script>
