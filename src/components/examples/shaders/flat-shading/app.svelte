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
	const cameraTranslationAmount = 3;
	const degrees = 0.5;
	const angle = DEG2RAD * degrees;

	const SHININESS_MAX = 300;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resizeRenderer } from "@functions/resizeRenderer";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { DEG2RAD } from "three/src/math/MathUtils.js";
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
		updateCameraAspect(camera, canvasSize.width / canvasSize.height);
	});

	let shininess = $state(material.shininess);
	const getShininess = () => shininess;
	const setShininess = (value: number) => {
		material.shininess = value;
		flatShadingMaterial.shininess = value;
		shininess = value;
	};

	let color = $state(`#${material.color.getHexString()}`);
	const getColor = () => color;
	const setColor = (value: string) => {
		material.color.set(value);
		flatShadingMaterial.color.set(value);
		color = value;
	};

	let flatShading = $state(flatShadingMesh.visible);
	const getFlatShading = () => flatShading;
	const setFlatShading = (value: boolean) => {
		flatShadingMesh.visible = value;
		mesh.visible = !flatShadingMesh.visible;
		flatShading = value;
	};

	let directionalLightHelperVisible = $state((helper.visible = false));
	const getDirectionalLightHelperVisible = () => directionalLightHelperVisible;
	const setDirectionalLightHelperVisible = (value: boolean) => {
		directionalLightHelperVisible = helper.visible = value;
	};
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
					bind:value={getColor, setColor}
				/>
			</Label>
			<Label>
				shininess
				<input
					type="range"
					bind:value={getShininess, setShininess}
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
					bind:checked={getFlatShading, setFlatShading}
				/>
			</Label>
			<Label>
				directional light helper visible
				<input
					type="checkbox"
					bind:checked={
						getDirectionalLightHelperVisible, setDirectionalLightHelperVisible
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
			const renderer = createRenderer({
				antialias: true,
				canvas,
			});

			$effect(() => {
				resizeRenderer(renderer, canvasSize.width, canvasSize.height);
			});

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

			return () => {
				renderer.setAnimationLoop(null);
			};
		}}
	>
	</canvas>
</div>
