<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { createSphubeFunc } from "@functions/createSphubeFunc";
	import resize from "@functions/resize";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
	import {
		DoubleSide,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		WebGPURenderer,
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
</script>

<canvas
	class="example-canvas"
	bind:clientWidth={canvasSize.width}
	bind:clientHeight={canvasSize.height}
	{@attach (canvas) => {
		const renderer = new WebGPURenderer({
			antialias: true,
			canvas,
		});

		const render = () => {
			renderer.render(scene, camera);
		};

		const promise = renderer.init().then((renderer) => {
			return $effect.root(() => {
				$effect(() => {
					resize(renderer, camera, canvasSize);

					render();
				});

				return () => {
					renderer.dispose();
				};
			});
		});

		controls.connect(renderer.domElement);
		controls.addEventListener("change", render);

		return () => {
			controls.removeEventListener("change", render);
			controls.disconnect();
			promise.then((cleanup) => cleanup());
		};
	}}
>
</canvas>
