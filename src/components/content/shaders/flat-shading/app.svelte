<script lang="ts">
	import AspectCamera from "@classes/AspectCamera.svelte";
	import Size from "@classes/Size.svelte";
	import renderer from "@attachments/renderer.svelte";
	import type { Setup } from "@attachments/renderer.svelte";
	import { Mesh, MeshNormalMaterial, Scene, SphereGeometry } from "three";

	const size = new Size();

	const camera = new AspectCamera(() => size.aspect);
	camera.position.set(0, 0, 3);

	const material = new MeshNormalMaterial({
		flatShading: true,
	});

	const geometry = new SphereGeometry(1, 16, 8);
	const mesh = new Mesh(geometry, material);
	camera.lookAt(mesh.position);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			scene.remove(mesh);
			material.dispose();
			geometry.dispose();
		};
	});

	const angle = (1 / 256) * Math.PI;

	const setup: Setup = (renderer) => {
		$effect(() => {
			renderer.setSize(size.width, size.height);
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
	bind:clientWidth={size.width}
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
