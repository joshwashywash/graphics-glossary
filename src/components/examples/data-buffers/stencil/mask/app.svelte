<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { TransformControls } from "three/addons/controls/TransformControls.js";
	import {
		CircleGeometry,
		EqualStencilFunc,
		Group,
		Mesh,
		MeshBasicMaterial,
		MeshNormalMaterial,
		NotEqualStencilFunc,
		PerspectiveCamera,
		ReplaceStencilOp,
		RingGeometry,
		Scene,
		TorusKnotGeometry,
		WebGPURenderer,
	} from "three/webgpu";

	const stencilRef = 1;

	const meshGeometry = new TorusKnotGeometry();
	const meshMaterial = new MeshNormalMaterial({
		stencilRef,
		stencilWrite: true,
	});

	const maskGeometry = new CircleGeometry();

	const maskMaterial = new MeshBasicMaterial({
		depthWrite: false,
		colorWrite: false,
		stencilRef,
		stencilWrite: true,
		stencilZPass: ReplaceStencilOp,
	});

	const maskMesh = new Mesh(maskGeometry, maskMaterial);

	const maskRingGeometry = new RingGeometry(1, 1.05);
	const maskRingMaterial = new MeshBasicMaterial({
		color: "white",
	});

	const maskRingMesh = new Mesh(maskRingGeometry, maskRingMaterial);

	const maskGroup = new Group().add(maskMesh, maskRingMesh).translateZ(1);

	const mesh = new Mesh(meshGeometry, meshMaterial);

	const scene = new Scene().add(mesh, maskGroup);

	const camera = new PerspectiveCamera().translateZ(5);
	camera.lookAt(scene.position);

	let invert = $state(false);
	const meshMaterialStencilFunc = $derived(
		invert ? NotEqualStencilFunc : EqualStencilFunc,
	);

	const canvasSize = new Size();

	const controls = new TransformControls(camera).attach(maskGroup);
	controls.showZ = false;

	const helper = controls.getHelper();
	scene.add(helper);

	useCleanup(() => {
		maskGeometry.dispose();
		maskMaterial.dispose();
		meshMaterial.dispose();
		meshGeometry.dispose();
		helper.dispose();
		controls.detach().dispose();
	});
</script>

<Example>
	{#snippet pane()}
		<details>
			<summary>mask</summary>
			<Label>
				invert
				<input
					type="checkbox"
					bind:checked={invert}
				/>
			</Label>
		</details>
	{/snippet}

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = new WebGPURenderer({
				antialias: true,
				canvas,
				stencil: true,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			controls.connect(renderer.domElement);
			controls.addEventListener("change", render);

			const promise = renderer.init().then((renderer) => {
				return $effect.root(() => {
					$effect(() => {
						renderer.setSize(canvasSize.width, canvasSize.height, false);

						const aspect = canvasSize.width / canvasSize.height;

						updateCameraAspect(camera, aspect);
						render();
					});

					$effect(() => {
						meshMaterial.stencilFunc = meshMaterialStencilFunc;
						render();
					});
				});
			});

			return () => {
				renderer.dispose();
				promise.then((cleanup) => cleanup());
				controls.removeEventListener("change", render);
			};
		}}
	>
	</canvas>
</Example>
