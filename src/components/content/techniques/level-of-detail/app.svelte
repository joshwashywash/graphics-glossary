<script lang="ts">
	import Size from "@classes/Size.svelte";

	import Canvas from "@components/canvas.svelte";
	import Example from "@components/example.svelte";

	import { setSize } from "@contexts/size";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import { Element, Pane } from "svelte-tweakpane-ui";
	import {
		IcosahedronGeometry,
		LOD,
		Mesh,
		MeshNormalMaterial,
		Scene,
	} from "three";

	const size = setSize(new Size());

	const camera = createAspectPerspectiveCamera(() => size.aspect);

	const z = 5;
	camera.position.set(0, 0, 1 + z);

	const material = new MeshNormalMaterial({
		wireframe: true,
	});

	const offset = 3;
	const distances = [z - offset, offset, z + offset];

	const lod = new LOD();
	const meshes: Mesh[] = [];

	for (let i = 0, l = distances.length; i < l; i += 1) {
		const detail = l - i - 1;
		const geometry = new IcosahedronGeometry(1, detail);
		const mesh = new Mesh(geometry, material);
		mesh.matrixAutoUpdate = false;
		meshes.push(mesh);
		lod.addLevel(mesh, distances[i]);
	}

	$effect(() => {
		return () => {
			for (const mesh of meshes) {
				mesh.geometry.dispose();
			}
			material.dispose();
		};
	});

	const scene = new Scene();
	const addToScene = createAdd(() => scene);

	addToScene(() => lod);
</script>

<Example>
	<Pane
		position="inline"
		title="level of detail"
	>
		<Element>
			<div bind:clientWidth={size.width}>
				<Canvas
					withRenderer={(renderer) => {
						renderer.setAnimationLoop((time) => {
							renderer.render(scene, camera);

							time *= 1 / 1000;
							const z = (1 + offset) * Math.sin(0.75 * time);
							lod.position.setZ(z);
						});

						return () => {
							renderer.setAnimationLoop(null);
						};
					}}
				/>
			</div>
		</Element>
	</Pane>
</Example>
