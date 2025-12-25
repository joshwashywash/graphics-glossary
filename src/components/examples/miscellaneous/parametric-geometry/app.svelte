<script lang="ts">
	import { createRendererAttachment } from "@attachments/createRendererAttachment.svelte";

	import { Size } from "@classes/size.svelte";

	import { createSphubeFunc } from "@functions/createSphubeFunc";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
	import {
		DoubleSide,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
	} from "three/webgpu";

	const material = new MeshNormalMaterial({
		side: DoubleSide,
	});

	const detail = 1 << 8;
	const sphubeGeometry = new ParametricGeometry(
		createSphubeFunc(),
		detail,
		detail,
	);
	const pringleGeometry = new ParametricGeometry(
		(u, v, target) => {
			v *= 2 * Math.PI;
			const cosV = Math.cos(v);
			const sinV = Math.sin(v);

			const x = u * cosV;
			const y = u * sinV;
			const z = u * u * cosV * sinV;

			target.set(x, y, z);
		},
		detail,
		detail,
	);

	useCleanup(() => {
		material.dispose();
		pringleGeometry.dispose();
		sphubeGeometry.dispose();
	});

	const sphubeMesh = new Mesh(sphubeGeometry, material).translateX(-1);
	const pringleMesh = new Mesh(pringleGeometry, material)
		.rotateX(0.5 * Math.PI)
		.translateX(1);

	const scene = new Scene().add(pringleMesh, sphubeMesh);

	const camera = new PerspectiveCamera().translateZ(5);
	const controls = new OrbitControls(camera);

	const canvasSize = new Size();

	const attachment = createRendererAttachment((renderer) => {
		const render = () => {
			renderer.render(scene, camera);
		};

		$effect(() => {
			renderer.setSize(canvasSize.width, canvasSize.height, false);
			const aspect = canvasSize.width / canvasSize.height;
			updateCameraAspect(camera, aspect);

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
