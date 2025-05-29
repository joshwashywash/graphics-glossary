<script lang="ts">
	import renderer from "@attachments/renderer.svelte";
	import type { Setup } from "@attachments/renderer.svelte";
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
	camera.position.set(0, 0, 3);
	camera.lookAt(mesh.position);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			material.dispose();
			geometry.dispose();
		};
	});

	const angle = (1 / 256) * Math.PI;

	let clientWidth = $state<number>();
	const width = $derived(clientWidth ?? 1);
	const height = $derived(0.5 * width);
	const aspect = $derived(width / height);

	$effect(() => {
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
	});

	const setup: Setup = (renderer) => {
		$effect(() => {
			renderer.setSize(width, height);
		});

		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
			mesh.rotateY(angle);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div
	class="relative"
	bind:clientWidth
>
	<fieldset class="absolute left-2">
		<label>
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
	</fieldset>
	<canvas
		class="w-full"
		{@attach renderer(setup)}
	>
	</canvas>
</div>
