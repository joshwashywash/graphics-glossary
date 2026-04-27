<script
	module
	lang="ts"
>
	const loader = new TextureLoader();
	const textureUrl = import.meta.env.BASE_URL + "/equirect/suburban_garden.png";
</script>

<script lang="ts">
	import { createMask } from "./createMask";

	import { controls } from "@attachments/controls";
	import { pane } from "@attachments/pane";

	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createDisposed } from "@functions/createDisposed.svelte";
	import { onCleanup } from "@functions/onCleanup.svelte";
	import { resize } from "@functions/resize";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import {
		CircleGeometry,
		DoubleSide,
		EqualStencilFunc,
		EquirectangularReflectionMapping,
		Mesh,
		MeshBasicMaterial,
		MeshStandardMaterial,
		NotEqualStencilFunc,
		PerspectiveCamera,
		Scene,
		TextureLoader,
		TorusKnotGeometry,
		Vector3,
		WebGPURenderer,
	} from "three/webgpu";

	const stencilRef = 1;
	const { maskedMaterialParameters, maskMaterialParameters } =
		createMask(stencilRef);

	const knotGeometry = createDisposed(TorusKnotGeometry);
	const knotMaterial = createDisposed(MeshStandardMaterial, {
		...maskedMaterialParameters,
		color: "#550000",
	});

	const knot = new Mesh(knotGeometry, knotMaterial);

	const maskGeometry = createDisposed(CircleGeometry);
	const maskMaterial = createDisposed(MeshBasicMaterial, {
		colorWrite: false,
		depthTest: false,
		side: DoubleSide,
		...maskMaterialParameters,
	});

	const mask = new Mesh(maskGeometry, maskMaterial);
	mask.renderOrder = -1;

	const CAMERA_TRANSLATION_AXIS = new Vector3(0.25, 0.25, 1).normalize();
	const CAMERA_TRANSLATION_AMOUNT = 5;
	const camera = new PerspectiveCamera().translateOnAxis(
		CAMERA_TRANSLATION_AXIS,
		CAMERA_TRANSLATION_AMOUNT,
	);

	camera.lookAt(knot.position);

	const equirectTexture = await loader.loadAsync(textureUrl);
	equirectTexture.mapping = EquirectangularReflectionMapping;
	onCleanup(() => {
		equirectTexture.dispose();
	});

	const scene = new Scene().add(knot, mask);
	scene.background = scene.environment = equirectTexture;

	const orbit = new OrbitControls(camera);

	const KNOT_ROTATION_AMOUNT = Math.PI * (1 / 240);
</script>

<div class="relative">
	<PaneContainer
		class="absolute top-2 right-2"
		{@attach pane(
			{
				title: "controls",
			},
			(pane) => {
				pane
					.addBinding(
						{
							invert: knotMaterial.stencilFunc === NotEqualStencilFunc,
						},
						"invert",
					)
					.on("change", (e) => {
						knotMaterial.stencilFunc = e.value
							? NotEqualStencilFunc
							: EqualStencilFunc;
					});
			},
		)}
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
				const t = time / 1000;
				const x = Math.cos(t);
				const y = Math.sin(t);
				mask.position.set(x, y, 0);
				knot.rotateY(KNOT_ROTATION_AMOUNT);
				if (resize(renderer)) {
					const aspect = canvas.clientWidth / canvas.clientHeight;
					setCameraAspect(camera, aspect);
				}
				renderer.render(scene, camera);
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
