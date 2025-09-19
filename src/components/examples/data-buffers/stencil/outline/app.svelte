<script lang="ts">
	import { Size } from "@classes/Size.svelte";

	import { List, Pane } from "svelte-tweakpane-ui";
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

	const meshRecord: Record<Name, Mesh> = {
		box: new Mesh(new BoxGeometry(), material),
		torus: new Mesh(new TorusGeometry(), material),
		knot: new Mesh(new TorusKnotGeometry(), material),
	};

	const outlineMeshRecord: Record<Name, Mesh> = {
		box: new Mesh(meshRecord.box.geometry, outlineMaterial),
		torus: new Mesh(meshRecord.torus.geometry, outlineMaterial),
		knot: new Mesh(meshRecord.knot.geometry, outlineMaterial),
	};

	const scaleAmount = 1.05;
	for (const name of names) {
		outlineMeshRecord[name].scale.setScalar(scaleAmount);
	}

	const translationAmount = 3;
	const kHat = new Vector3(0, 0, 1);
	const axis = new Vector3(1, 0, 0);

	const groups: Group[] = [];

	const a = (2 * Math.PI) / names.length;
	for (const name of names) {
		const mesh = meshRecord[name];
		const outlineMesh = outlineMeshRecord[name];
		outlineMesh.visible = false;

		const group = new Group().add(mesh, outlineMesh);

		axis.applyAxisAngle(kHat, a);
		group.translateOnAxis(axis, translationAmount);
		groups.push(group);
	}

	const scene = new Scene().add(...groups);

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(kHat, 15);
	camera.lookAt(scene.position);

	$effect(() => {
		return () => {
			material.dispose();
			outlineMaterial.dispose();
			for (const name of names) meshRecord[name].geometry.dispose();
		};
	});

	const rotationAmount = (1 / 180) * Math.PI;

	let outlineMesh = $state(outlineMeshRecord.knot);
	$effect(() => {
		const mesh = outlineMesh;
		mesh.visible = true;
		return () => {
			mesh.visible = false;
		};
	});
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
	<div class="absolute bottom-2 right-2 not-content">
		<Pane position="inline">
			<List
				bind:value={outlineMesh}
				label="add outline to "
				options={outlineMeshRecord}
			/>
		</Pane>
	</div>
</div>
