<script lang="ts">
	import { createRendererAttachment } from "@attachments/createRendererAttachment.svelte";

	import { Size } from "@classes/size.svelte";

	import { pringle } from "@functions/parametric/functions/pringle";
	import { createSphube } from "@functions/parametric/functions/sphube";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
	import {
		DoubleSide,
		Group,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
	} from "three/webgpu";

	const material = new MeshNormalMaterial({
		side: DoubleSide,
	});

	const detail = 1 << 8;

	const sphubeGeometry = new ParametricGeometry(createSphube(), detail, detail);
	const pringleGeometry = new ParametricGeometry(pringle, detail, detail);

	useCleanup(() => {
		sphubeGeometry.dispose();
		pringleGeometry.dispose();
		material.dispose();
	});

	const sphubeMesh = new Mesh(sphubeGeometry, material).translateX(-1);
	const pringleMesh = new Mesh(pringleGeometry, material).translateX(1);

	const group = new Group().add(pringleMesh, sphubeMesh);

	const camera = new PerspectiveCamera().translateZ(5);
	const controls = new OrbitControls(camera);

	const canvasSize = new Size();

	const attachment = createRendererAttachment((renderer) => {
		const render = () => {
			renderer.render(group, camera);
		};

		$effect(() => {
			renderer.setSize(canvasSize.width, canvasSize.height, false);
			updateCameraAspect(camera, canvasSize.ratio);

			render();
		});

		controls.addEventListener("change", render);
		controls.connect(renderer.domElement);

		return () => {
			controls.removeEventListener("change", render);
			controls.disconnect();
		};
	});
</script>

<canvas
	class="example-canvas"
	bind:clientWidth={canvasSize.width}
	bind:clientHeight={canvasSize.height}
	{@attach attachment}
>
</canvas>
