<script
	lang="ts"
	module
>
	const cameraTranslationAxis = new Vector3(0, 0, 1);
	const cameraTranslationAmount = 5;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resizeRenderer } from "@functions/resizeRenderer";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
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
		Vector3,
	} from "three/webgpu";

	const stencilRef = 1;

	const meshGeometry = useDisposable(TorusKnotGeometry);
	const meshMaterial = useDisposable(MeshNormalMaterial, {
		stencilFunc: EqualStencilFunc,
		stencilRef,
		stencilWrite: true,
	});

	const maskGeometry = useDisposable(CircleGeometry);

	const maskMaterial = useDisposable(MeshBasicMaterial, {
		colorWrite: false,
		depthWrite: false,
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

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);
	camera.lookAt(scene.position);

	let invert = $state(false);
	const getInvert = () => invert;
	const setInvert = (value: boolean) => {
		meshMaterial.stencilFunc = value ? NotEqualStencilFunc : EqualStencilFunc;
		invert = value;
	};

	const canvasSize = new Size();

	$effect(() => {
		updateCameraAspect(camera, canvasSize.width / canvasSize.height);
	});
</script>

<div class="relative">
	<details class="example-pane">
		<summary>mask</summary>
		<Label>
			invert
			<input
				type="checkbox"
				bind:checked={getInvert, setInvert}
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
				stencil: true,
			});

			$effect(() => {
				resizeRenderer(renderer, canvasSize.width, canvasSize.height);
			});

			renderer.setAnimationLoop(() => {
				renderer.render(scene, camera);
			});

			const controls = new TransformControls(
				camera,
				renderer.domElement,
			).attach(maskGroup);
			controls.showZ = false;

			scene.add(controls.getHelper());

			return () => {
				controls.disconnect();
				controls.dispose();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
