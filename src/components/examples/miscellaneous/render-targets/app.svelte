<script
	lang="ts"
	module
>
	const hdrLoader = new HDRLoader();
	const axis = new Vector3(1, 0, 1).normalize();
</script>

<script lang="ts">
	import { onCleanup } from "@functions/onCleanup.svelte";

	import {
		DoubleSide,
		EquirectangularReflectionMapping,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		PlaneGeometry,
		Scene,
		Vector3,
		WebGLRenderTarget,
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

	const hdr = hdrLoader
		.loadAsync("/hdrs/university_workshop_1k.hdr")
		.then((hdr) => {
			hdr.mapping = EquirectangularReflectionMapping;
			return hdr;
		});

	let clientWidth = $state(1);
	let clientHeight = $state(1);

	const aspect = $derived(clientWidth / clientHeight);

	const geometry = new PlaneGeometry();
	const target = new WebGLRenderTarget(1, 1);
	const material = new MeshBasicMaterial({
		map: target.texture,
		side: DoubleSide,
	});

	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(axis, 2);
	camera.lookAt(scene.position);

	const controls = new OrbitControls(camera);

	onCleanup(() => {
		geometry.dispose();
		material.dispose();
		target.dispose();
	});
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
			mesh.visible = false;

			const last = renderer.getRenderTarget();

			renderer.setRenderTarget(target);
			renderer.render(scene, camera);

			mesh.visible = true;

			const lastBlurriness = scene.backgroundBlurriness;
			scene.backgroundBlurriness = 0.1;

			renderer.setRenderTarget(last);
			renderer.render(scene, camera);

			scene.backgroundBlurriness = lastBlurriness;
		};

		hdr.then((hdr) => {
			scene.background = hdr;
			scene.environment = hdr;
			render();
		});

		$effect(() => {
			target.setSize(clientWidth, clientHeight);
			render();
		});

		$effect(() => {
			renderer.setSize(clientWidth, clientHeight, false);
			render();
		});

		$effect(() => {
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
			render();
		});

		controls.addEventListener("change", render);
		controls.connect(renderer.domElement);

		return () => {
			controls.removeEventListener("change", render);
			controls.disconnect();
			renderer.dispose();
		};
	}}
>
</canvas>
