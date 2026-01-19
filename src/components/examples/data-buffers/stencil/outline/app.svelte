<script
	lang="ts"
	module
>
	const translationAmount = 3;

	const kHat = new Vector3(0, 0, 1);
	const axis = new Vector3(1, 0, 0);

	const initialOutlineScale = 1.1;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { useUpdateCameraAspect } from "@functions/updateCameraAspect.svelte";
	import { useCleanup } from "@functions/useCleanup.svelte";
	import { useResizeRenderer } from "@functions/useResizeRenderer.svelte";

	import { OrbitControls } from "three/examples/jsm/Addons.js";
	import {
		BoxGeometry,
		BufferGeometry,
		Group,
		Mesh,
		MeshBasicMaterial,
		MeshNormalMaterial,
		NotEqualStencilFunc,
		PerspectiveCamera,
		ReplaceStencilOp,
		TorusGeometry,
		TorusKnotGeometry,
		Vector3,
	} from "three/webgpu";

	const stencilRef = 1;

	const material = new MeshNormalMaterial({
		stencilRef,
		stencilWrite: true,
		stencilZPass: ReplaceStencilOp,
	});

	const outlineMaterial = new MeshBasicMaterial({
		color: "#ffffff",
		depthWrite: false,
		stencilFunc: NotEqualStencilFunc,
		stencilRef,
		stencilWrite: true,
	});

	const geometries: BufferGeometry[] = [
		new BoxGeometry(),
		new TorusKnotGeometry(),
		new TorusGeometry(),
	];

	useCleanup(() => {
		material.dispose();
		outlineMaterial.dispose();
		for (const geometry of geometries) geometry.dispose();
	});

	const a = (2 * Math.PI) / geometries.length;

	const meshGroup = new Group();
	const outlineMeshes: Mesh[] = [];
	const outlineGroup = new Group();

	const allGroup = new Group().add(meshGroup, outlineGroup);

	for (const geometry of geometries) {
		const mesh = new Mesh(geometry, material).translateOnAxis(
			axis.applyAxisAngle(kHat, a),
			translationAmount,
		);
		meshGroup.add(mesh);

		const outlineMesh = new Mesh(geometry, outlineMaterial).translateOnAxis(
			axis,
			translationAmount,
		);
		outlineMesh.scale.setScalar(initialOutlineScale);

		outlineMeshes.push(outlineMesh);
		outlineGroup.add(outlineMesh);
	}

	const camera = new PerspectiveCamera().translateOnAxis(
		kHat,
		5 * translationAmount,
	);
	camera.lookAt(allGroup.position);

	let outlinesVisible = $state(outlineGroup.visible);
	const getOutlinesVisible = () => outlinesVisible;
	const setOutlinesVisible = (value: boolean) => {
		outlinesVisible = outlineGroup.visible = value;
	};

	let outlineScale = $state(initialOutlineScale);
	const getOutlineScale = () => outlineScale;
	const setOutlineScale = (value: number) => {
		for (const mesh of outlineMeshes) mesh.scale.setScalar(value);
		outlineScale = value;
	};

	let outlineColor = $state(`#${outlineMaterial.color.getHexString()}`);
	const getOutlineColor = () => outlineColor;
	const setOutlineColor = (value: string) => {
		outlineMaterial.color.setStyle(value);
		outlineColor = value;
	};

	const canvasSize = new Size();

	useUpdateCameraAspect({
		getAspect: () => canvasSize.ratio,
		getCamera: () => camera,
	});
</script>

<div class="relative">
	<details class="example-pane">
		<summary>controls</summary>
		<Label>
			outlines visible
			<input
				type="checkbox"
				bind:checked={getOutlinesVisible, setOutlinesVisible}
			/>
		</Label>
		<Label>
			color
			<input
				type="color"
				bind:value={getOutlineColor, setOutlineColor}
			/>
		</Label>
		<Label>
			scale
			<input
				type="range"
				bind:value={getOutlineScale, setOutlineScale}
				min={1}
				max={2}
				step={0.1}
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

			useResizeRenderer(() => renderer, canvasSize);

			const controls = new OrbitControls(camera, renderer.domElement);
			controls.autoRotate = true;

			renderer.setAnimationLoop(() => {
				controls.update();
				renderer.render(allGroup, camera);
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
