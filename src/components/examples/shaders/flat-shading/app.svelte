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
	import createPaneAttachment from "@attachments/createPane";

	import { Size } from "@classes/size.svelte";

	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useDisposable } from "@functions/useDisposable.svelte";

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

	const geometry = useDisposable(SphereGeometry);

	const material = useDisposable(MeshPhongMaterial, {
		color: "#770077",
		shininess: 0.5 * SHININESS_MAX,
	});

	const ambientLight = useDisposable(AmbientLight);
	const directionalLight = useDisposable(DirectionalLight).translateOnAxis(
		directionalLightTranslationAxis,
		directionalLightTranslationAmount,
	);

	const helper = useDisposable(DirectionalLightHelper, directionalLight);

	const mesh = new Mesh(geometry, material);
	mesh.visible = false;
	const flatShadingMaterial = useDisposable(MeshPhongMaterial).copy(material);
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

	const canvasSize = new Size();

	$effect(() => {
		updateCameraAspect(camera, canvasSize.ratio);
	});

	const pane = createPaneAttachment({
		initialize: (pane) => {
			const materialFolder = pane.addFolder({
				title: "material",
			});

			materialFolder.addBinding(
				{
					get shininess() {
						return material.shininess;
					},
					set shininess(value) {
						flatShadingMaterial.shininess = material.shininess = value;
					},
				},
				"shininess",
				{
					min: 0,
					max: SHININESS_MAX,
					step: 1,
				},
			);

			materialFolder.addBinding(
				{
					get color() {
						return `#${material.color.getHexString()}`;
					},
					set color(value) {
						flatShadingMaterial.color.copy(material.color.set(value));
					},
				},
				"color",
			);

			const sceneFolder = pane.addFolder({
				title: "scene",
			});

			sceneFolder.addBinding(helper, "visible", {
				label: "light helper visible",
			});

			sceneFolder.addBinding(
				{
					get flatShading() {
						return flatShadingMesh.visible;
					},
					set flatShading(value) {
						mesh.visible = !(flatShadingMesh.visible = value);
					},
				},
				"flatShading",
				{
					label: "flat shading",
				},
			);
		},
	});
</script>

<div class="relative">
	<PaneContainer
		class="absolute top-2 right-2"
		{@attach pane}
	/>
	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = createRenderer(
				{
					antialias: true,
					canvas,
				},
				() => canvasSize.width,
				() => canvasSize.height,
			);

			const controls = useDisposable(
				OrbitControls,
				camera,
				renderer.domElement,
			);
			controls.autoRotate = true;

			renderer.setAnimationLoop(() => {
				controls.update();
				renderer.render(scene, camera);
			});
		}}
	>
	</canvas>
</div>
