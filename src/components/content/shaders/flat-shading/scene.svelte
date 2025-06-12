<script lang="ts">
	import { getSize } from "@contexts/size";
	import { getWithRenderer } from "@contexts/withRenderer";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import { Mesh, MeshNormalMaterial, Scene, SphereGeometry } from "three";
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

	const scene = new Scene();

	const add = createAdd(() => scene);

	add(() => mesh);

	const size = getSize();

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 3);
	camera.lookAt(mesh.position);

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
			controls.disconnect();
		};
	});
</script>
