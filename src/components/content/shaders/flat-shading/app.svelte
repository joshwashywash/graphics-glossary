<script lang="ts">
	import { renderer } from "@attachments/renderer.svelte";
	import type { Setup } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import { Checkbox, Element, Pane } from "svelte-tweakpane-ui";
	import { Mesh, MeshNormalMaterial, Scene, SphereGeometry } from "three";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";

	const size = new Size();

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 3);

	const controls = new OrbitControls(camera);
	controls.autoRotate = true;

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

	const setup: Setup = (renderer) => {
		controls.connect(renderer.domElement);

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
			controls.dispose();
		};
	};
</script>

<div
	bind:clientWidth={size.width}
	class="not-content"
>
	<Pane
		position="inline"
		title="flat-shading"
	>
		<Element>
			<canvas
				{@attach renderer(
					() => size.width,
					() => size.height,
					setup,
				)}
			>
			</canvas>
		</Element>
		<Checkbox
			bind:value={
				() => material.flatShading,
				(value) => {
					material.flatShading = value;
					material.needsUpdate = true;
				}
			}
			label="flat shading"
		/>
		<Checkbox
			bind:value={controls.autoRotate}
			label="auto-rotate"
		/>
	</Pane>
</div>
