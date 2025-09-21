<script lang="ts">
	import { Size } from "@classes/Size.svelte";

	import GUI from "lil-gui";
	import { untrack } from "svelte";
	import {
		BoxGeometry,
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

	const names = ["box", "torus", "knot"] as const;
	type Name = (typeof names)[number];

	const outlineMeshes: Record<Name, Mesh> = {
		box: new Mesh(new BoxGeometry(), outlineMaterial),
		torus: new Mesh(new TorusGeometry(), outlineMaterial),
		knot: new Mesh(new TorusKnotGeometry(), outlineMaterial),
	};

	const translationAmount = 3;
	const scaleAmount = 1.05;

	const kHat = new Vector3(0, 0, 1);
	const axis = new Vector3(1, 0, 0);

	const groups: Group[] = [];

	const a = (2 * Math.PI) / names.length;
	for (const mesh of Object.values(outlineMeshes)) {
		mesh.visible = false;
		mesh.scale.setScalar(scaleAmount);

		const group = new Group().add(mesh, new Mesh(mesh.geometry, material));

		axis.applyAxisAngle(kHat, a);
		group.translateOnAxis(axis, translationAmount);
		groups.push(group);
	}

	const scene = new Scene().add(...groups);

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(kHat, 5 * translationAmount);
	camera.lookAt(scene.position);

	$effect(() => {
		return () => {
			material.dispose();
			outlineMaterial.dispose();
			for (const name of names) {
				outlineMeshes[name].geometry.dispose();
			}
		};
	});

	let outlineMesh = $state(outlineMeshes.torus);
	$effect(() => {
		const mesh = outlineMesh;
		const last = mesh.visible;
		mesh.visible = true;
		return () => {
			mesh.visible = last;
		};
	});

	const params = {
		get outlineMesh() {
			return untrack(() => outlineMesh);
		},
		set outlineMesh(value) {
			outlineMesh = value;
		},
	};

	const rotationAmount = (1 / 180) * Math.PI;
</script>

<div
	bind:clientWidth={canvasSize.width}
	class="relative"
>
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
	<div
		class="absolute top-0 right-4 not-content"
		{@attach (container) => {
			const gui = new GUI({
				container,
			});

			gui.add(params, "outlineMesh", outlineMeshes).name("apply outline to");

			return gui.destroy;
		}}
	></div>
</div>
