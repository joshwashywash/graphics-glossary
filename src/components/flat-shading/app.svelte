<script lang="ts">
	import rendererAttachment from "@utils/rendererAttachment.svelte";
	import type { Init } from "@utils/rendererAttachment.svelte";
	import {
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		SphereGeometry,
	} from "three";

	const material = new MeshNormalMaterial({
		flatShading: true,
	});
	const geometry = new SphereGeometry(1, 16, 8);
	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera();
	camera.position.set(2, 2, 2);
	camera.lookAt(mesh.position);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			material.dispose();
			geometry.dispose();
		};
	});

	const angle = (1 / (1 << 9)) * Math.PI;

	const init: Init = (renderer) => {
		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
			mesh.rotateY(angle);
		});
		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div>
	<canvas {@attach rendererAttachment(init)}></canvas>
</div>
