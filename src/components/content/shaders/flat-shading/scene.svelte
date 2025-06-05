<script lang="ts">
	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import { getAdd } from "@contexts/add";
	import { getSize } from "@contexts/size";
	import { getWithRenderer } from "@contexts/withRenderer";
	import { Mesh, MeshNormalMaterial, SphereGeometry } from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let {
		autoRotate = true,
		flatShading = true,
	}: {
		flatShading?: boolean;
		autoRotate?: boolean;
	} = $props();

	const geometry = new SphereGeometry(1, 16, 8);
	const material = new MeshNormalMaterial();

	$effect(() => {
		return () => {
			geometry.dispose();
			material.dispose();
		};
	});

	$effect(() => {
		material.flatShading = flatShading;
		material.needsUpdate = true;
	});

	const mesh = new Mesh(geometry, material);

	const add = getAdd();

	const scene = add(mesh);

	const size = getSize();

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 3);
	camera.lookAt(mesh.position);

	$effect(() => {
		camera.aspect = size.aspect;
		camera.updateProjectionMatrix();
	});

	const controls = new OrbitControls(camera);
	$effect(() => {
		controls.autoRotate = autoRotate;
	});

	const withRenderer = getWithRenderer();

	withRenderer((renderer) => {
		controls.connect(renderer.domElement);

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
			controls.dispose();
		};
	});
</script>
