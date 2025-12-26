<script
	lang="ts"
	module
>
	const translationAmount = 3;

	const kHat = new Vector3(0, 0, 1);
	const axis = new Vector3(1, 0, 0);

	const initialOutlineScale = 1.1;

	const degrees = 1;
	const angle = DEG2RAD * degrees;
</script>

<script lang="ts">
	import { createRendererAttachment } from "@attachments/createRendererAttachment.svelte";

	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { DEG2RAD } from "three/src/math/MathUtils.js";
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
		for (const geometry of geometries) {
			geometry.dispose();
		}
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

		outlineMeshes.push(outlineMesh);
		outlineGroup.add(outlineMesh);
	}

	const camera = new PerspectiveCamera().translateOnAxis(
		kHat,
		5 * translationAmount,
	);
	camera.lookAt(allGroup.position);

	let outlinesVisible = $state(true);
	let outlineScale = $state(initialOutlineScale);
	let outlineColor = $state("#ffffff");

	let rotateMeshes = $state(true);

	const canvasSize = new Size();

	let animationLoop: null | (() => void) = null;

	const attachment = createRendererAttachment(
		(renderer) => {
			const render = () => {
				renderer.render(allGroup, camera);
			};

			const renderIfNotAnimating = () => {
				if (animationLoop === null) render();
			};

			const loop = () => {
				allGroup.rotateY(angle);
				render();
			};

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);
				const aspect = canvasSize.width / canvasSize.height;
				updateCameraAspect(camera, aspect);
				renderIfNotAnimating();
			});

			$effect(() => {
				outlineGroup.visible = outlinesVisible;
				renderIfNotAnimating();
			});

			$effect(() => {
				outlineMaterial.color.setStyle(outlineColor);
				renderIfNotAnimating();
			});

			$effect(() => {
				for (const mesh of outlineMeshes) {
					mesh.scale.setScalar(outlineScale);
				}
				renderIfNotAnimating();
			});

			$effect(() => {
				if (!rotateMeshes) return;

				renderer.setAnimationLoop((animationLoop = loop));

				return () => {
					renderer.setAnimationLoop((animationLoop = null));
				};
			});
		},
		{ stencil: true },
	);
</script>

<Example>
	{#snippet pane()}
		<details>
			<summary>controls</summary>
			<Label>
				outlines visible
				<input
					type="checkbox"
					bind:checked={outlinesVisible}
				/>
			</Label>
			<Label>
				color
				<input
					type="color"
					bind:value={outlineColor}
				/>
			</Label>
			<Label>
				scale
				<input
					type="range"
					bind:value={outlineScale}
					min={1}
					max={2}
					step={0.1}
				/>
			</Label>
			<Label>
				rotate meshes
				<input
					type="checkbox"
					bind:checked={rotateMeshes}
				/>
			</Label>
		</details>
	{/snippet}

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach attachment}
	>
	</canvas>
</Example>
