<script lang="ts">
	import createColorAttribute from "./createColorAttribute";

	import Size from "@classes/Size.svelte";

	import Canvas from "@components/canvas.svelte";
	import Example from "@components/example.svelte";

	import { setSize } from "@contexts/size";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import { Element, Pane } from "svelte-tweakpane-ui";
	import { BoxGeometry, Mesh, MeshBasicMaterial, Scene } from "three";

	const geometry = new BoxGeometry();

	const positionAttribute = geometry.getAttribute("position");

	// the default box geometry positions range from -0.5 -> 0.5
	// `f` remaps this to 0 -> 1
	const f = (n: number): number => 0.5 + n;
	const colorAttribute = createColorAttribute(positionAttribute, {
		x: f,
		y: f,
		z: f,
	});

	geometry.setAttribute("color", colorAttribute);

	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	$effect(() => {
		return () => {
			material.dispose();
			geometry.dispose();
		};
	});

	const scene = new Scene();
	const addToScene = createAdd(() => scene);

	const mesh = new Mesh(geometry, material);
	addToScene(() => mesh);

	const size = setSize(new Size());

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 3);

	const angleY = (1 / 256) * Math.PI;
	const angleZ = angleY / 3;
</script>

<Example>
	<Pane
		position="inline"
		title="vertex colors"
	>
		<Element>
			<div bind:clientWidth={size.width}>
				<Canvas
					withRenderer={(renderer) => {
						renderer.setAnimationLoop(() => {
							renderer.render(scene, camera);
							mesh.rotateY(angleY).rotateZ(angleZ);
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
