<script lang="ts">
	import { Size } from "@classes/Size.svelte";

	import type { Intersection } from "three";
	import {
		Mesh,
		MeshBasicMaterial,
		MeshNormalMaterial,
		NotEqualStencilFunc,
		PerspectiveCamera,
		Raycaster,
		ReplaceStencilOp,
		Scene,
		TorusGeometry,
		Vector2,
		Vector3,
		WebGLRenderer,
	} from "three";

	const canvasSize = new Size();

	const geometry = new TorusGeometry();

	const stencilRef = 1;

	const material = new MeshNormalMaterial({
		stencilRef,
		stencilWrite: true,
		stencilZPass: ReplaceStencilOp,
	});
	const mesh = new Mesh(geometry, material);

	const outlineMaterial = new MeshBasicMaterial({
		depthTest: false,
		depthWrite: false,
		stencilFunc: NotEqualStencilFunc,
		stencilRef,
		stencilWrite: true,
	});
	const outlineMesh = new Mesh(geometry, outlineMaterial);
	let last = false;
	outlineMesh.visible = last;
	outlineMesh.scale.setScalar(1.05);

	const meshes = [outlineMesh, mesh];

	const scene = new Scene().add(...meshes);

	const camera = new PerspectiveCamera();
	const axis = new Vector3(2, 1, 2).normalize();
	camera.translateOnAxis(axis, 5);
	camera.lookAt(scene.position);

	$effect(() => {
		return () => {
			scene.remove(...meshes);
			material.dispose();
			outlineMaterial.dispose();
			geometry.dispose();
		};
	});

	let rect: DOMRect;
	const raycaster = new Raycaster();
	const coords = new Vector2();

	let intersections: Intersection[] = [];
	let render: () => void;
</script>

<div bind:clientWidth={canvasSize.width}>
	<canvas
		onpointerenter={(e) => {
			rect = e.currentTarget.getBoundingClientRect();
		}}
		onpointermove={(e) => {
			// remap to 0 -> 1
			let x = (e.clientX - rect.left) / rect.width;
			let y = (e.clientY - rect.top) / rect.height;

			// remap to -1 -> 1
			x = 2 * x - 1;
			y = -1 * 2 * y + 1;

			raycaster.setFromCamera(coords.set(x, y), camera);

			intersections.length = 0;
			raycaster.intersectObject(mesh, false, intersections);
			const visible = (outlineMesh.visible = intersections.length > 0);

			if (last !== visible) {
				render();
				last = visible;
			}
		}}
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				canvas,
				stencil: true,
			});

			render = () => {
				renderer.render(scene, camera);
			};

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
				render();
			});

			return () => {
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
