<script lang="ts">
	import createColorAttribute from "./createColorAttribute";
	import rendererAttachment from "@utils/rendererAttachment.svelte";
	import type { Init } from "@utils/rendererAttachment.svelte";
	import {
		BoxGeometry,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
	} from "three";

	const geometry = new BoxGeometry();
	const position = geometry.getAttribute("position");

	// the default box geometry positions range from -0.5 -> 0.5
	// `f` is meant to remap this to 0 -> 1
	const f = (n: number): number => 0.5 + n;
	const colorAttribute = createColorAttribute(position, f, f, f);

	geometry.setAttribute("color", colorAttribute);

	const material = new MeshBasicMaterial({
		vertexColors: true,
	});

	const mesh = new Mesh(geometry, material);
	const s = new Scene().add(mesh);

	const camera = new PerspectiveCamera();
	camera.position.set(2, 2, 2);
	camera.lookAt(mesh.position);

	const angleY = (1 / (1 << 9)) * Math.PI;
	const angleZ = angleY / 3;

	$effect(() => {
		return () => {
			s.remove(mesh);
			material.dispose();
			geometry.dispose();
		};
	});

	const init: Init = (renderer) => {
		const width = renderer.domElement.parentElement?.clientWidth ?? 1;
		renderer.setSize(width, width);

		renderer.setAnimationLoop(() => {
			renderer.render(s, camera);
			mesh.rotateY(angleY).rotateZ(angleZ);
		});
		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div>
	<canvas {@attach rendererAttachment(init)}></canvas>
</div>
