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

	import { controls } from "@attachments/controls";

	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createDisposed } from "@functions/createDisposed.svelte";
	import { onCleanup } from "@functions/onCleanup.svelte";
	import { resize } from "@functions/resize";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { HDRLoader, OrbitControls } from "three/examples/jsm/Addons.js";
	import {
		EquirectangularReflectionMapping,
		Group,
		Mesh,
		MeshBasicMaterial,
		MeshStandardMaterial,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
		WebGPURenderer,
	} from "three/webgpu";
	import { Pane } from "tweakpane";

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
		depthTest: false,
		...outlineMaterialParameters,
	});

	const outline = new Mesh(geometry, outlineMaterial);
	outline.scale.setScalar(1.05);

	const group = new Group().add(mesh, outline);
	const scene = new Scene().add(group);
	scene.environment = scene.background = equirectTexture;

	const camera = new PerspectiveCamera().translateZ(5);

	const orbit = new OrbitControls(camera);

	let lastTime = 0;
</script>

<div class="relative">
	<PaneContainer
		class="absolute top-2 right-2"
		{@attach (container) => {
			const pane = createDisposed(Pane, {
				container,
				title: "outline",
			});
			pane.addBinding(outline, "visible");
		}}
	/>
	<canvas
		class="aspect-square"
		{@attach controls(orbit)}
		{@attach (canvas) => {
			const renderer = new WebGPURenderer({
				antialias: true,
				canvas,
				forceWebGL: true,
				stencil: true,
			});

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
</div>
