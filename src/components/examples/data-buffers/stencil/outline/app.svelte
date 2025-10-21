<script
	lang="ts"
	module
>
	const translationAmount = 3;

	const kHat = new Vector3(0, 0, 1);
	const axis = new Vector3(1, 0, 0);

	const rotationAmount = (1 / 180) * Math.PI;
	const initialOutlineScale = 1.1;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label, Pane } from "@components/controls";

	import { onCleanup } from "@functions/onCleanup.svelte";

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

	onCleanup(() => {
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

		const group = new Group().add(mesh, outlineMesh);

		axis.applyAxisAngle(kHat, a);
		group.translateOnAxis(axis, translationAmount);
		groups.push(group);
	}

	const scene = new Scene().add(...groups);

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(kHat, 5 * translationAmount);
	camera.lookAt(scene.position);

	let outlinesVisible = $state(true);
	$effect(() => {
		for (const outlineMesh of outlineMeshes) {
			outlineMesh.visible = outlinesVisible;
		}
	});

	let outlineColor = $state("#ffffff");
	$effect(() => {
		outlineMaterial.color.setStyle(outlineColor);
	});

	let outlineScale = $state(initialOutlineScale);
	$effect(() => {
		for (const mesh of outlineMeshes) {
			mesh.scale.setScalar(outlineScale);
		}
	});

	const canvasSize = new Size();
</script>

<div class="relative">
	<Pane class="absolute top-2 right-2">
		<details open>
			<summary>outlines</summary>
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
		</details>
	</Pane>

	<canvas
		class="w-full aspect-square"
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

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);
				render();
			});

			$effect(() => {
				camera.aspect = canvasSize.aspect;
				camera.updateProjectionMatrix();
				render();
			});

			renderer.setAnimationLoop(() => {
				for (const group of groups) {
					group.rotateY(rotationAmount);
				}
				render();
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
