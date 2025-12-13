<script
	lang="ts"
	module
>
	const directionalLightAxis = new Vector3(0.25, 0.25, 1).normalize();
	const cameraAxis = new Vector3(0, 0, 1);
	const degrees = 0.5;
	const angle = DEG2RAD * degrees;

	const SHININESS_MAX = 300;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

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
		WebGPURenderer,
	} from "three/webgpu";

	let color = $state("#770077");
	let shininess = $state(0.5 * SHININESS_MAX);

	let rotate = $state(true);
	let flatShading = $state(true);

	let directionalLightHelperVisible = $state(false);

	const geometry = new SphereGeometry();

	const material = new MeshPhongMaterial();

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

	const flatShadingMesh = new Mesh(geometry, flatShadingMaterial);

	const meshes = [mesh, flatShadingMesh];

	const scene = new Scene().add(
		...meshes,
		ambientLight,
		directionalLight,
		helper,
	);

	directionalLight.lookAt(scene.position);
	helper.update();

	const camera = new PerspectiveCamera().translateOnAxis(cameraAxis, 3);
	camera.lookAt(scene.position);

	let animationLoop: null | (() => void) = null;

	const controls = new OrbitControls(camera);

	const size = new Size();
</script>

<Example>
	{#snippet pane()}
		<details>
			<summary>controls</summary>
			<fieldset>
				<legend>material</legend>
				<Label>
					color
					<input
						type="color"
						bind:value={color}
					/>
				</Label>
				<Label>
					shininess
					<input
						type="range"
						bind:value={shininess}
						min={0}
						max={SHININESS_MAX}
						step={1}
					/>
				</Label>
			</fieldset>
			<fieldset>
				<summary>scene</summary>
				<Label>
					flat shading
					<input
						type="checkbox"
						bind:checked={flatShading}
					/>
				</Label>
				<Label>
					rotate
					<input
						type="checkbox"
						bind:checked={rotate}
					/>
				</Label>
				<Label>
					directional light helper visible
					<input
						type="checkbox"
						bind:checked={directionalLightHelperVisible}
					/>
				</Label>
			</fieldset>
		</details>
	{/snippet}

	<canvas
		class="example-canvas"
		bind:clientWidth={size.width}
		bind:clientHeight={size.height}
		{@attach (canvas) => {
			const renderer = new WebGPURenderer({
				antialias: true,
				canvas,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			const renderIfNotAnimating = () => {
				if (animationLoop === null) render();
			};

			const loop = () => {
				for (const mesh of meshes) {
					mesh.rotateY(angle);
				}
				render();
			};

			controls.connect(renderer.domElement);

			const promise = renderer.init().then((renderer) => {
				return $effect.root(() => {
					$effect(() => {
						material.color.set(color);
						flatShadingMaterial.color.set(color);
						renderIfNotAnimating();
					});

					$effect(() => {
						material.shininess = shininess;
						flatShadingMaterial.shininess = shininess;
						renderIfNotAnimating();
					});

					$effect(() => {
						flatShadingMesh.visible = flatShading;
						mesh.visible = !flatShadingMesh.visible;
						renderIfNotAnimating();
					});

					$effect(() => {
						helper.visible = directionalLightHelperVisible;
						renderIfNotAnimating();
					});

					$effect(() => {
						renderer.setSize(size.width, size.height, false);

						const aspect = size.width / size.height;

						updateCameraAspect(camera, aspect);

						renderIfNotAnimating();
					});

					$effect(() => {
						if (rotate) {
							renderer.setAnimationLoop((animationLoop = loop));

							return () => {
								renderer.setAnimationLoop((animationLoop = null));
							};
						}

						controls.addEventListener("change", render);

						return () => {
							controls.removeEventListener("change", render);
						};
					});
				});
			});

			return () => {
				controls.disconnect();
				renderer.dispose();
				promise.then((cleanup) => cleanup());
			};
		}}
	>
	</canvas>
</Example>
