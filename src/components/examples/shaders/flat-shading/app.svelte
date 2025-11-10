<script
	lang="ts"
	module
>
	const directionalLightAxis = new Vector3(1, 0.75, 1).normalize();
	const cameraAxis = new Vector3(0, 0, 1).normalize();
	const degrees = 0.5;
	const angle = DEG2RAD * degrees;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";

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
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { DEG2RAD } from "three/src/math/MathUtils.js";

	let rotateMeshes = $state(true);

	let directionalLightHelperVisible = $state(true);

	const distance = 3;
	const halfDistance = 0.5 * distance;

	const geometry = new SphereGeometry();

	const material = new MeshPhongMaterial({
		shininess: 150,
		color: "#770077",
	});
	const flatShadingMaterial = material.clone();
	flatShadingMaterial.flatShading = true;

	const ambientLight = new AmbientLight();
	const directionalLight = new DirectionalLight();
	const helper = new DirectionalLightHelper(directionalLight);

	directionalLight.translateOnAxis(directionalLightAxis, 3);

	onCleanup(() => {
		ambientLight.dispose();
		directionalLight.dispose();
		material.dispose();
		flatShadingMaterial.dispose();
		geometry.dispose();
		helper.dispose();
	});

	const mesh = new Mesh(geometry, material);
	mesh.translateX(-1 * halfDistance);

	const flatShadingMesh = new Mesh(geometry, flatShadingMaterial);
	flatShadingMesh.translateX(halfDistance);

	const meshes = [mesh, flatShadingMesh];

	const scene = new Scene().add(
		...meshes,
		ambientLight,
		directionalLight,
		helper,
	);
	directionalLight.lookAt(scene.position);
	helper.update();

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(cameraAxis, 2 * distance);
	camera.lookAt(scene.position);

	const canvasSize = new Size();

	let animationLoop: null | (() => void) = null;

	const controls = new OrbitControls(camera);
</script>

<Example>
	{#snippet pane()}
		<details open>
			<summary>controls</summary>
			<Label>
				rotate meshes
				<input
					type="checkbox"
					bind:checked={rotateMeshes}
				/>
			</Label>
			<Label>
				directional light helper visible
				<input
					type="checkbox"
					bind:checked={directionalLightHelperVisible}
				/>
			</Label>
		</details>
	{/snippet}

	<canvas
		class="w-full aspect-square"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			const renderIfNotAnimating = () => {
				if (animationLoop === null) render();
			};

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);

				const aspect = canvasSize.width / canvasSize.height;
				updateCameraAspect(camera, aspect);

				renderIfNotAnimating();
			});

			$effect(() => {
				helper.visible = directionalLightHelperVisible;
				renderIfNotAnimating();
			});

			$effect(() => {
				if (rotateMeshes) {
					renderer.setAnimationLoop(
						(animationLoop = () => {
							for (const mesh of meshes) {
								mesh.rotateY(angle);
							}
							render();
						}),
					);

					return () => {
						renderer.setAnimationLoop((animationLoop = null));
					};
				}

				controls.addEventListener("change", render);
				return () => {
					controls.removeEventListener("change", render);
				};
			});

			controls.connect(renderer.domElement);

			return () => {
				controls.disconnect();
				renderer.dispose();
			};
		}}
	>
	</canvas>
</Example>
