<script
	lang="ts"
	module
>
	const directionalLightTranslationAxis = new Vector3(
		0.25,
		0.25,
		1,
	).normalize();
	const directionalLightTranslationAmount = 3;

	const cameraTranslationAxis = new Vector3(0, 0, 1);
	const cameraTranslationAmount = 5;

	const SHININESS_MAX = 300;
</script>

<script lang="ts">
	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createDisposed } from "@functions/createDisposed.svelte";
	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resize } from "@functions/resize.svelte";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import {
		AmbientLight,
		DirectionalLight,
		DirectionalLightHelper,
		Mesh,
		MeshPhongMaterial,
		PerspectiveCamera,
		Scene,
		SphereGeometry,
		Vector3,
	} from "three/webgpu";
	import { Pane } from "tweakpane";

	const geometry = createDisposed(SphereGeometry);

	const material = createDisposed(MeshPhongMaterial, {
		color: "#770077",
		shininess: 0.5 * SHININESS_MAX,
	});

	const ambientLight = createDisposed(AmbientLight);
	const directionalLight = createDisposed(DirectionalLight).translateOnAxis(
		directionalLightTranslationAxis,
		directionalLightTranslationAmount,
	);

	const helper = createDisposed(DirectionalLightHelper, directionalLight);

	const mesh = new Mesh(geometry, material);
	mesh.visible = false;
	const flatShadingMaterial = createDisposed(MeshPhongMaterial).copy(material);
	flatShadingMaterial.flatShading = true;

	const flatShadingMesh = new Mesh(geometry, flatShadingMaterial);

	const scene = new Scene().add(
		mesh,
		flatShadingMesh,
		ambientLight,
		directionalLight,
		helper,
	);

	directionalLight.lookAt(scene.position);

	helper.update();

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);
	camera.lookAt(scene.position);
</script>

<div class="relative">
	<PaneContainer
		class="absolute top-2 right-2"
		{@attach (container) => {
			const pane = createDisposed(Pane, {
				container,
				title: "controls",
			});

			const materialFolder = pane.addFolder({
				title: "material",
			});

			materialFolder
				.addBinding(material, "shininess", {
					min: 0,
					max: SHININESS_MAX,
					step: 1,
				})
				.on("change", (e) => {
					flatShadingMaterial.shininess = e.value;
				});

			materialFolder
				.addBinding(
					{
						color: `#${material.color.getHexString()}`,
					},
					"color",
				)
				.on("change", (e) => {
					flatShadingMaterial.color.copy(material.color.set(e.value));
				});

			const sceneFolder = pane.addFolder({
				title: "scene",
			});

			sceneFolder.addBinding(helper, "visible", {
				label: "show light helper",
			});

			sceneFolder
				.addBinding(flatShadingMesh, "visible", {
					label: "flat shading",
				})
				.on("change", (e) => {
					mesh.visible = !e.value;
				});
		}}
	/>
	<canvas
		class="aspect-video"
		{@attach (canvas) => {
			const renderer = createRenderer({
				antialias: true,
				canvas,
			});

			const controls = createDisposed(
				OrbitControls,
				camera,
				renderer.domElement,
			);
			controls.autoRotate = true;

			renderer.setAnimationLoop(() => {
				const canvas = renderer.domElement;
				if (resize(renderer)) {
					const aspect = canvas.clientWidth / canvas.clientHeight;
					setCameraAspect(camera, aspect);
				}

				controls.update();
				renderer.render(scene, camera);
			});
		}}
	>
	</canvas>
</div>
