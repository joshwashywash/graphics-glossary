<script
	lang="ts"
	module
>
	const directionalLightAxis = new Vector3(0.25, 0.25, 1).normalize();
	const cameraTranslationAxis = new Vector3(0, 0, 1);
	const degrees = 0.5;
	const angle = DEG2RAD * degrees;

	const SHININESS_MAX = 300;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { devicePixelRatio } from "svelte/reactivity/window";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { DEG2RAD } from "three/src/math/MathUtils.js";
	import {
		AmbientLight,
		DirectionalLight,
		DirectionalLightHelper,
		Group,
		Mesh,
		MeshPhongMaterial,
		PerspectiveCamera,
		Scene,
		SphereGeometry,
		Vector3,
		WebGPURenderer,
	} from "three/webgpu";

	const geometry = new SphereGeometry();

	const material = new MeshPhongMaterial({
		color: "#770077",
		shininess: 0.5 * SHININESS_MAX,
	});

	let shininess = $state(material.shininess);
	let color = $state(`#${material.color.getHexString()}`);

	const flatShadingMaterial = material.clone();
	flatShadingMaterial.flatShading = true;

	const ambientLight = new AmbientLight();
	const directionalLight = new DirectionalLight().translateOnAxis(
		directionalLightAxis,
		3,
	);

	const helper = new DirectionalLightHelper(directionalLight);

	useCleanup(() => {
		ambientLight.dispose();
		directionalLight.dispose();
		material.dispose();
		flatShadingMaterial.dispose();
		geometry.dispose();
		helper.dispose();
	});

	const mesh = new Mesh(geometry, material);
	mesh.visible = false;

	const flatShadingMesh = new Mesh(geometry, flatShadingMaterial);
	let flatShading = $state(flatShadingMesh.visible);

	const group = new Group().add(mesh, flatShadingMesh);

	const scene = new Scene().add(group, ambientLight, directionalLight, helper);

	directionalLight.lookAt(scene.position);

	helper.update();
	let directionalLightHelperVisible = $state((helper.visible = false));

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		3,
	);
	camera.lookAt(scene.position);

	const canvasSize = new Size();
</script>

<div class="relative">
	<details class="example-pane">
		<summary>controls</summary>
		<fieldset>
			<legend>material</legend>
			<Label>
				color
				<input
					type="color"
					bind:value={
						() => color,
						(value) => {
							material.color.set(value);
							flatShadingMaterial.color.set(value);
							color = value;
						}
					}
				/>
			</Label>
			<Label>
				shininess
				<input
					type="range"
					bind:value={
						() => shininess,
						(value) => {
							material.shininess = value;
							flatShadingMaterial.shininess = value;
							shininess = value;
						}
					}
					min={0}
					max={SHININESS_MAX}
					step={1}
				/>
			</Label>
		</fieldset>
		<fieldset>
			<legend>scene</legend>
			<Label>
				flat shading
				<input
					type="checkbox"
					bind:checked={
						() => flatShading,
						(value) => {
							flatShadingMesh.visible = value;
							mesh.visible = !flatShadingMesh.visible;
							flatShading = value;
						}
					}
				/>
			</Label>
			<Label>
				directional light helper visible
				<input
					type="checkbox"
					bind:checked={
						() => directionalLightHelperVisible,
						(value) => {
							helper.visible = value;
							directionalLightHelperVisible = value;
						}
					}
				/>
			</Label>
		</fieldset>
	</details>

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = new WebGPURenderer({
				antialias: true,
				canvas,
			});

			$effect(() => {
				renderer.setPixelRatio(devicePixelRatio.current);
			});

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);
				updateCameraAspect(camera, canvasSize.ratio);
			});

			renderer.setAnimationLoop(() => {
				group.rotateY(angle);
				renderer.render(scene, camera);
			});

			const controls = new OrbitControls(camera, renderer.domElement);

			return () => {
				controls.dispose();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
