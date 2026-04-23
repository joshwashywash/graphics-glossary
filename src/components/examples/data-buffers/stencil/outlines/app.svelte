<script
	module
	lang="ts"
>
	const loader = new HDRLoader();
	const textureUrl =
		import.meta.env.BASE_URL + "/hdrs/university_workshop_1k.hdr";
</script>

<script lang="ts">
	import { createOutline } from "./createOutline";

	import { createDisposed } from "@functions/createDisposed.svelte";
	import { onCleanup } from "@functions/onCleanup.svelte";
	import { resize } from "@functions/resize";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { HDRLoader, OrbitControls } from "three/examples/jsm/Addons.js";
	import type { Intersection } from "three/webgpu";
	import {
		EquirectangularReflectionMapping,
		Group,
		Mesh,
		MeshBasicMaterial,
		MeshStandardMaterial,
		PerspectiveCamera,
		Raycaster,
		Scene,
		TorusKnotGeometry,
		Vector2,
		WebGPURenderer,
	} from "three/webgpu";

	const equirectTexture = await loader.loadAsync(textureUrl);
	equirectTexture.mapping = EquirectangularReflectionMapping;
	onCleanup(() => {
		equirectTexture.dispose();
	});

	const { materialParameters, outlineMaterialParameters } = createOutline();

	const geometry = createDisposed(TorusKnotGeometry);
	const material = createDisposed(MeshStandardMaterial, {
		...materialParameters,
	});
	const mesh = new Mesh(geometry, material);

	const outlineMaterial = createDisposed(MeshBasicMaterial, {
		color: "black",
		depthWrite: false,
		...outlineMaterialParameters,
	});

	const outline = new Mesh(geometry, outlineMaterial);
	outline.visible = false;
	outline.scale.setScalar(1.05);

	const group = new Group().add(mesh, outline);
	const scene = new Scene().add(group);
	scene.environment = scene.background = equirectTexture;

	const camera = new PerspectiveCamera().translateZ(5);

	const controls = new OrbitControls(camera);

	const raycaster = new Raycaster();
	const coords = new Vector2();

	let intersections: Intersection[] = [];
</script>

<canvas
	class="aspect-square"
	onmousemove={(e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		coords.set(
			2 * ((e.clientX - rect.left) / (rect.right - rect.left)) - 1,
			-1 * 2 * ((e.clientY - rect.top) / (rect.bottom - rect.top)) + 1,
		);

		raycaster.setFromCamera(coords, camera);
		raycaster.intersectObject(mesh, false, intersections);
		outline.visible = intersections.length > 0;

		intersections = [];
	}}
	{@attach (canvas) => {
		const renderer = new WebGPURenderer({
			antialias: true,
			canvas,
			forceWebGL: true,
			stencil: true,
		});

		controls.connect(canvas);

		let lastTime = 0;
		const promise = renderer.setAnimationLoop((time) => {
			const dt = time - lastTime;
			group.rotateY(dt / 1000);

			if (resize(renderer)) {
				const aspect = canvas.clientWidth / canvas.clientHeight;
				setCameraAspect(camera, aspect);
			}

			renderer.render(scene, camera);
			lastTime = time;
		});

		return () => {
			controls.dispose();
			promise
				.then(() => {
					return renderer.setAnimationLoop(null);
				})
				.then(() => {
					renderer.dispose();
				});
		};
	}}
>
</canvas>
