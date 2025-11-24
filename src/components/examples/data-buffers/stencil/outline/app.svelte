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
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

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
		Scene,
		TorusGeometry,
		TorusKnotGeometry,
		Vector3,
		WebGLRenderer,
	} from "three";
	import { DEG2RAD } from "three/src/math/MathUtils.js";

	const stencilRef = 1;

	const material = new MeshNormalMaterial({
		stencilRef,
		stencilWrite: true,
		stencilZPass: ReplaceStencilOp,
	});

	const outlineMaterial = new MeshBasicMaterial({
		depthTest: false,
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

	const groups: Group[] = [];
	const outlineMeshes: Mesh[] = [];

	for (const geometry of geometries) {
		const mesh = new Mesh(geometry, material);

		const outlineMesh = new Mesh(geometry, outlineMaterial);
		outlineMeshes.push(outlineMesh);

		mesh.getObjectsByProperty;

		groups.push(
			new Group()
				.add(mesh, outlineMesh)
				.translateOnAxis(axis.applyAxisAngle(kHat, a), translationAmount),
		);
	}

	const scene = new Scene().add(...groups);

	const camera = new PerspectiveCamera().translateOnAxis(
		kHat,
		5 * translationAmount,
	);
	camera.lookAt(scene.position);

	let outlinesVisible = $state(true);
	let outlineScale = $state(initialOutlineScale);
	let outlineColor = $state("#ffffff");

	let rotateMeshes = $state(true);

	const canvasSize = new Size();

	let animationLoop: null | (() => void) = null;
</script>

<Example>
	{#snippet pane()}
		<details open>
			<summary>controls</summary>
			<Label>
				visible
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
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
				stencil: true,
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
				for (const outlineMesh of outlineMeshes) {
					outlineMesh.visible = outlinesVisible;
				}
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

				renderer.setAnimationLoop(
					(animationLoop = () => {
						for (const group of groups) {
							group.rotateY(angle);
						}
						render();
					}),
				);

				return () => {
					renderer.setAnimationLoop((animationLoop = null));
				};
			});

			return () => {
				renderer.dispose();
			};
		}}
	>
	</canvas>
</Example>
