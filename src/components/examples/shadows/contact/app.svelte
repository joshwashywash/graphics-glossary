<script
	lang="ts"
	module
>
	const cameraTranslationAxis = new Vector3(0, 1, 1).normalize();
	const cameraTranslationAmount = 10;

	const PLANE_SIZE = 5;

	const HALF_PLANE_SIZE = 0.5 * PLANE_SIZE;
	const SHADOW_CAMERA_FAR = 1;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resizeRenderer } from "@functions/resizeRenderer.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import { gaussianBlur } from "three/addons/tsl/display/GaussianBlurNode.js";
	import { OrbitControls } from "three/examples/jsm/Addons.js";
	import { DEG2RAD } from "three/src/math/MathUtils.js";
	import { depth, texture, uniform, vec3 } from "three/tsl";
	import {
		CameraHelper,
		Color,
		Mesh,
		MeshNormalMaterial,
		NodeMaterial,
		OrthographicCamera,
		PerspectiveCamera,
		PlaneGeometry,
		RenderTarget,
		Scene,
		TorusKnotGeometry,
		Vector3,
	} from "three/webgpu";
	import { Pane } from "tweakpane";

	const uDarkness = uniform(1);
	const uShadowOpacity = uniform(1);
	const uBlur = uniform(3.5);

	const depthMaterial = useDisposable(NodeMaterial);
	depthMaterial.colorNode = vec3();
	depthMaterial.opacityNode = depth.oneMinus().mul(uDarkness);
	depthMaterial.depthTest = false;
	depthMaterial.depthWrite = false;

	const renderTargetSize = 1 << 8;
	const renderTarget = useDisposable(
		RenderTarget,
		renderTargetSize,
		renderTargetSize,
	);
	renderTarget.texture.generateMipmaps = false;

	const shadowPlaneMaterial = useDisposable(NodeMaterial);
	shadowPlaneMaterial.transparent = true;
	shadowPlaneMaterial.depthWrite = false;
	shadowPlaneMaterial.colorNode = vec3();
	shadowPlaneMaterial.opacityNode = gaussianBlur(
		texture(renderTarget.texture),
		uBlur,
	).a.mul(uShadowOpacity);

	const planeGeometry = useDisposable(PlaneGeometry, PLANE_SIZE, PLANE_SIZE);

	const shadowPlaneMesh = new Mesh(planeGeometry, shadowPlaneMaterial).rotateX(
		-1 * 0.5 * Math.PI,
	);

	const meshGeometry = useDisposable(TorusKnotGeometry, 1, 0.4, 64, 8, 3, 1);
	const meshMaterial = useDisposable(MeshNormalMaterial);
	const mesh = new Mesh(meshGeometry, meshMaterial).translateY(2);

	const shadowCamera = new OrthographicCamera(
		-1 * HALF_PLANE_SIZE,
		HALF_PLANE_SIZE,
		HALF_PLANE_SIZE,
		-1 * HALF_PLANE_SIZE,
		0,
		SHADOW_CAMERA_FAR,
	);
	shadowCamera.lookAt(mesh.position);

	const helper = useDisposable(CameraHelper, shadowCamera);

	const scene = new Scene().add(shadowPlaneMesh, mesh, helper);
	scene.background = new Color("#eeeeee");

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);
	camera.lookAt(mesh.position);

	const canvasSize = new Size();
	$effect(() => {
		updateCameraAspect(camera, canvasSize.ratio);
	});
</script>

<div class="relative">
	<PaneContainer
		class="absolute top-2 right-2"
		{@attach (container) => {
			const pane = useDisposable(Pane, {
				container,
				expanded: false,
				title: "controls",
			});

			const uniformFolder = pane.addFolder({
				title: "uniforms",
			});
			pane.addBinding(uDarkness, "value", {
				label: "darkness",
				min: 0,
				max: 1,
				step: 0.1,
			});

			uniformFolder.addBinding(uShadowOpacity, "value", {
				label: "opacity",
				min: 0,
				max: 1,
				step: 0.1,
			});

			uniformFolder.addBinding(uBlur, "value", {
				label: "blur",
				min: 0,
				max: 5,
				step: 0.5,
			});

			const sceneFolder = pane.addFolder({
				title: "scene",
			});

			sceneFolder.addBinding(helper, "visible", {
				label: "shadow camera helper visible",
			});
		}}
	/>
	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = createRenderer({
				antialias: true,
				canvas,
			});

			$effect(() => {
				resizeRenderer(renderer, canvasSize.width, canvasSize.height);
			});

			useDisposable(OrbitControls, camera, renderer.domElement);

			renderer.setAnimationLoop(() => {
				mesh.rotateX(1 * DEG2RAD).rotateZ(0.5 * DEG2RAD);

				const lastBackground = scene.background;
				scene.background = null;

				const lastOverrideMaterial = scene.overrideMaterial;
				scene.overrideMaterial = depthMaterial;

				const lastRenderTarget = renderer.getRenderTarget();
				renderer.setRenderTarget(renderTarget);

				const lastCameraHelperVisible = helper.visible;

				helper.visible = false;

				renderer.render(scene, shadowCamera);

				scene.background = lastBackground;
				scene.overrideMaterial = lastOverrideMaterial;
				renderer.setRenderTarget(lastRenderTarget);

				helper.visible = lastCameraHelperVisible;

				renderer.render(scene, camera);
			});
		}}
	>
	</canvas>
</div>
