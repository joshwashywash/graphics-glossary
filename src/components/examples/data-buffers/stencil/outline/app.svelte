<script lang="ts">
	import { Size } from "@classes/Size.svelte";

	import {
		BoxGeometry,
		ConeGeometry,
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

	const canvasSize = new Size();

	const stencilRef = 1;

	const material = new MeshNormalMaterial({
		stencilRef,
		stencilWrite: true,
		stencilZPass: ReplaceStencilOp,
	});

	const outlineMaterial = new MeshBasicMaterial({
		depthTest: false,
		depthWrite: false,
		stencilFunc: NotEqualStencilFunc,
		stencilRef,
		stencilWrite: true,
	});

	const geometries = [
		new BoxGeometry(),
		new TorusGeometry(),
		new TorusKnotGeometry(),
	];

	const scaleAmount = 1.05;
	const translationAmount = 3;
	const kHat = new Vector3(0, 0, 1);
	const axis = new Vector3(1, 0, 0);

	const groups: Group[] = [];

	const a = (2 * Math.PI) / geometries.length;
	for (const geometry of geometries) {
		const mesh = new Mesh(geometry, material);
		const outlineMesh = new Mesh(geometry, outlineMaterial);
		outlineMesh.scale.setScalar(scaleAmount);
		const group = new Group().add(mesh, outlineMesh);
		groups.push(group);

		axis.applyAxisAngle(kHat, a);
		group.translateOnAxis(axis, translationAmount);
		groups.push(group);
	}

	const scene = new Scene().add(...groups);

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(kHat, 10);
	camera.lookAt(scene.position);

	$effect(() => {
		return () => {
			material.dispose();
			outlineMaterial.dispose();
			for (const geometry of geometries) geometry.dispose();
		};
	});

	const rotationAmount = (1 / 180) * Math.PI;
</script>

<div bind:clientWidth={canvasSize.width}>
	<canvas
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				canvas,
				stencil: true,
			});

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
			});

			renderer.setAnimationLoop(() => {
				for (const group of groups) group.rotateY(rotationAmount);
				renderer.render(scene, camera);
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
