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

	import { Label } from "@components/controls";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resizeRenderer } from "@functions/resizeRenderer";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

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

	const canvasSize = new Size();

	const uDarkness = uniform(1);
	const uShadowOpacity = uniform(1);
	const uBlur = uniform(3.5);

	const depthMaterial = new NodeMaterial();
	depthMaterial.colorNode = vec3();
	depthMaterial.opacityNode = depth.oneMinus().mul(uDarkness);
	depthMaterial.depthTest = false;
	depthMaterial.depthWrite = false;

	const renderTargetSize = 1 << 8;
	const renderTarget = new RenderTarget(renderTargetSize, renderTargetSize);
	renderTarget.texture.generateMipmaps = false;

	const shadowPlaneMaterial = new NodeMaterial();
	shadowPlaneMaterial.transparent = true;
	shadowPlaneMaterial.depthWrite = false;
	shadowPlaneMaterial.colorNode = vec3();
	shadowPlaneMaterial.opacityNode = gaussianBlur(
		texture(renderTarget.texture),
		uBlur,
	).a.mul(uShadowOpacity);

	const planeGeometry = new PlaneGeometry(PLANE_SIZE, PLANE_SIZE);

	const shadowPlaneMesh = new Mesh(planeGeometry, shadowPlaneMaterial).rotateX(
		-1 * 0.5 * Math.PI,
	);

	const meshGeometry = new TorusKnotGeometry(1, 0.4, 64, 8, 3, 1);
	const meshMaterial = new MeshNormalMaterial();
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

	const helper = new CameraHelper(shadowCamera);

	const scene = new Scene().add(shadowPlaneMesh, mesh, helper);
	scene.background = new Color("#eeeeee");

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);
	camera.lookAt(mesh.position);

	$effect(() => {
		updateCameraAspect(camera, canvasSize.width / canvasSize.height);
	});

	useCleanup(() => {
		depthMaterial.dispose();
		shadowPlaneMaterial.dispose();
		renderTarget.dispose();
		planeGeometry.dispose();
		meshGeometry.dispose();
		meshMaterial.dispose();
		helper.dispose();
	});

	let darkness = $state(uDarkness.value);
	let shadowOpacity = $state(uShadowOpacity.value);
	let blur = $state(uBlur.value);
	let shadowCameraHelperVisible = $state((helper.visible = false));
</script>

<div class="relative">
	<details class="example-pane">
		<summary>controls</summary>
		<Label>
			darkness
			<input
				bind:value={
					() => darkness,
					(value) => {
						darkness = uDarkness.value = value;
					}
				}
				type="range"
				min={0}
				max={1}
				step={0.1}
			/>
		</Label>
		<Label>
			shadow opacity
			<input
				bind:value={
					() => shadowOpacity,
					(value) => {
						shadowOpacity = uShadowOpacity.value = value;
					}
				}
				type="range"
				min={0}
				max={1}
				step={0.1}
			/>
		</Label>
		<Label>
			blur
			<input
				bind:value={
					() => blur,
					(value) => {
						blur = uBlur.value = value;
					}
				}
				type="range"
				min={0}
				max={5}
				step={0.5}
			/>
		</Label>
		<Label>
			shadow camera helper visible
			<input
				type="checkbox"
				bind:checked={
					() => shadowCameraHelperVisible,
					(value) => {
						helper.visible = shadowCameraHelperVisible = value;
					}
				}
			/>
		</Label>
	</details>

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

			const controls = new OrbitControls(camera, renderer.domElement);

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

			return () => {
				controls.dispose();

				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
