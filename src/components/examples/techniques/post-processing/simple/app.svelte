<script
	lang="ts"
	module
>
	const axis = new Vector3(0, 0, 1);
	const hdrLoader = new HDRLoader();

	const bayer4x4Matrix = mat4(
		0.0,
		8.0,
		2.0,
		10.0,
		12.0,
		4.0,
		14.0,
		6.0,
		3.0,
		11.0,
		1.0,
		9.0,
		15.0,
		7.0,
		13.0,
		5.0,
	)
		.mul(1 / 16.0)
		.setName("bayer4x4");

	const bayerIndex = uv().mul(screenSize).floor().mod(4).setName("bayerIndex");

	const bayerValue = bayer4x4Matrix
		.element(bayerIndex.y)
		.element(bayerIndex.x)
		.setName("bayerValue");
</script>

<script lang="ts">
	import { createRendererAttachment } from "@attachments/createRendererAttachment.svelte";

	import { Size } from "@classes/size.svelte";

	import { resize } from "@functions/resize";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
	import { Fn, dot, mat4, pass, screenSize, uv, vec3, vec4 } from "three/tsl";
	import {
		EquirectangularReflectionMapping,
		Mesh,
		MeshStandardMaterial,
		PerspectiveCamera,
		PostProcessing,
		Scene,
		TorusKnotGeometry,
		Vector3,
	} from "three/webgpu";

	const geometry = new TorusKnotGeometry();
	const material = new MeshStandardMaterial();
	const mesh = new Mesh(geometry, material);
	const scene = new Scene().add(mesh);

	const hdr = hdrLoader
		.loadAsync("/hdrs/university_workshop_1k.hdr")
		.then((hdr) => {
			hdr.mapping = EquirectangularReflectionMapping;
			scene.background = hdr;
			scene.environment = hdr;
		});

	const camera = new PerspectiveCamera().translateOnAxis(axis, 5);
	camera.lookAt(mesh.position);

	const controls = new OrbitControls(camera);

	useCleanup(() => {
		geometry.dispose();
		material.dispose();
	});

	const canvasSize = new Size();

	const outputNode = Fn(() => {
		const v = dot(vec3(0.2126, 0.7152, 0.0722), pass(scene, camera).rgb)
			.lessThan(bayerValue)
			.toFloat();
		return vec4(v, v, v, 1.0);
	});

	const attachment = createRendererAttachment((renderer) => {
		const postProcessing = new PostProcessing(renderer);
		postProcessing.outputNode = outputNode();

		const render = () => {
			postProcessing.render();
		};

		$effect(() => {
			resize(renderer, camera, canvasSize);
			render();
		});

		hdr.then(() => {
			render();
		});

		controls.addEventListener("change", render);
		controls.connect(renderer.domElement);

		return () => {
			controls.removeEventListener("change", render);
			controls.disconnect();
			postProcessing.dispose();
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
