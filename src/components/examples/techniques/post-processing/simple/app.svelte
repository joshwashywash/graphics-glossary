<script
	lang="ts"
	module
>
	const axis = new Vector3(-1, 1, -1).normalize();
	const hdrLoader = new HDRLoader();
</script>

<script lang="ts">
	import fragmentShader from "./fragments/mix.glsl?raw";
	import vertexShader from "./vertex.glsl?raw";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { createSphubeFunc } from "@functions/createSphubeFunc";
	import { needsResize } from "@functions/needsResize";
	import { onCleanup } from "@functions/onCleanup.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";

	import {
		Color,
		EquirectangularReflectionMapping,
		Mesh,
		MeshStandardMaterial,
		PerspectiveCamera,
		Scene,
		ShaderMaterial,
		Uniform,
		Vector3,
		WebGLRenderTarget,
		WebGLRenderer,
	} from "three";
	import { ParametricGeometry } from "three/examples/jsm/Addons.js";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
	import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";

	type Props = {
		alpha: number;
		color1: string;
		color2: string;
	};

	let {
		alpha = 0.3,
		color1 = "#272838",
		color2 = "#f3de8a",
	}: Partial<Props> = $props();

	hdrLoader.loadAsync("/hdrs/university_workshop_1k.hdr").then((hdr) => {
		hdr.mapping = EquirectangularReflectionMapping;
		scene.background = hdr;
		scene.environment = hdr;
	});

	const detail = 1 << 6;
	const geometry = new ParametricGeometry(createSphubeFunc(), detail, detail);

	const meshMaterial = new MeshStandardMaterial();
	const mesh = new Mesh(geometry, meshMaterial);

	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera().translateOnAxis(axis, 3);
	camera.lookAt(scene.position);

	const controls = new OrbitControls(camera);

	const renderTarget = new WebGLRenderTarget(1, 1);

	const uAlpha = new Uniform(0);
	const uColor1 = new Uniform(new Color());
	const uColor2 = new Uniform(new Color());
	const uScene = new Uniform(renderTarget.texture);
	const uTimeMs = new Uniform(0);

	const material = new ShaderMaterial({
		fragmentShader,
		uniforms: {
			uAlpha,
			uColor1,
			uColor2,
			uScene,
			uTimeMs,
		},
		vertexShader,
	});

	const quad = new FullScreenQuad(material);

	onCleanup(() => {
		material.dispose();
		quad.dispose();
		renderTarget.dispose();
		geometry.dispose();
		meshMaterial.dispose();
	});

	$effect(() => {
		uAlpha.value = alpha;
	});

	$effect(() => {
		uColor1.value.set(color1);
	});

	$effect(() => {
		uColor2.value.set(color2);
	});
</script>

<Example>
	{#snippet pane()}
		<details open>
			<summary>uniforms</summary>
			<Label>
				color 1
				<input
					type="color"
					bind:value={color1}
				/>
			</Label>
			<Label>
				color 2
				<input
					type="color"
					bind:value={color2}
				/>
			</Label>
			<Label>
				alpha
				<input
					type="range"
					bind:value={alpha}
					min={0}
					max={1}
					step={0.1}
				/>
			</Label>
		</details>
	{/snippet}

	<canvas
		class="example-canvas"
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
			});

			renderer.setAnimationLoop((time) => {
				if (needsResize(renderer.domElement)) {
					const { clientWidth, clientHeight } = renderer.domElement;
					renderTarget.setSize(clientWidth, clientHeight);
					renderer.setSize(clientWidth, clientHeight, false);

					updateCameraAspect(camera, clientWidth / clientHeight);
				}

				uTimeMs.value = time;

				const last = renderer.getRenderTarget();
				renderer.setRenderTarget(renderTarget);
				renderer.render(scene, camera);
				renderer.setRenderTarget(last);
				quad.render(renderer);
			});

			controls.connect(renderer.domElement);

			return () => {
				controls.disconnect();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</Example>
