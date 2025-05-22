<script lang="ts">
	import renderer from "@utils/attachments/renderer.svelte";
	import type { Init } from "@utils/attachments/renderer.svelte";
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

	const angle = (1 / 256) * Math.PI;

	const init: Init = (renderer) => {
		const width = renderer.domElement.parentElement?.clientWidth ?? 1;
		const height = 0.5 * width;

		const aspect = width / height;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);

		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
			mesh.rotateY(angle);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div class="relative">
	<label class="absolute left-2 flex gap-2">
		<input
			type="checkbox"
			bind:checked={
				() => material.flatShading,
				(value) => {
					material.flatShading = value;
					material.needsUpdate = true;
				}
			}
		/>
		use flat shading
	</label>
	<canvas {@attach renderer(init)}></canvas>
</div>
