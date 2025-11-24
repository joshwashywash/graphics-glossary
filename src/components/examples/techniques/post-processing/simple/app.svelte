<script
	lang="ts"
	module
>
	const axis = new Vector3(0, 0, 1);
	const hdrLoader = new HDRLoader();
</script>

<script lang="ts">
	import fragmentShader from "./fragments/dither.glsl?raw";
	import vertexShader from "./vertex.glsl?raw";

	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { onOrbitControls } from "@functions/onOrbitControls";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import type { Attachment } from "svelte/attachments";
	import {
		EquirectangularReflectionMapping,
		Mesh,
		MeshStandardMaterial,
		PerspectiveCamera,
		Scene,
		ShaderMaterial,
		TorusKnotGeometry,
		Uniform,
		Vector2,
		Vector3,
		WebGLRenderTarget,
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
	import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";

	hdrLoader.loadAsync("/hdrs/university_workshop_1k.hdr").then((hdr) => {
		hdr.mapping = EquirectangularReflectionMapping;
		scene.background = hdr;
		scene.environment = hdr;
	});

	const geometry = new TorusKnotGeometry();

	const meshMaterial = new MeshStandardMaterial();
	const mesh = new Mesh(geometry, meshMaterial);

	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera().translateOnAxis(axis, 7);
	camera.lookAt(scene.position);

	const controls = new OrbitControls(camera);

	const renderTarget = new WebGLRenderTarget(1, 1);

	const uScene = new Uniform(renderTarget.texture);
	const uResolution = new Uniform(new Vector2());

	const material = new ShaderMaterial({
		fragmentShader,
		uniforms: {
			uScene,
			uResolution,
		},
		vertexShader,
	});

	const quad = new FullScreenQuad(material);

	useCleanup(() => {
		material.dispose();
		quad.dispose();
		renderTarget.dispose();
		geometry.dispose();
		meshMaterial.dispose();
	});

	const resolution = new Size();

	let animationLoop: null | (() => void) = null;

	let autoRotateCamera = $state(true);

	const attachment: Attachment<HTMLCanvasElement> = (canvas) => {
		const renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		});

		const render = () => {
			const last = renderer.getRenderTarget();
			renderer.setRenderTarget(renderTarget);
			renderer.render(scene, camera);
			renderer.setRenderTarget(last);
			quad.render(renderer);
		};

		const renderIfNotAnimating = () => {
			if (animationLoop === null) render();
		};

		$effect(() => {
			renderTarget.setSize(resolution.width, resolution.height);

			renderer.setSize(resolution.width, resolution.height, false);
			renderer.getSize(uResolution.value);

			updateCameraAspect(camera, resolution.width / resolution.height);

			renderIfNotAnimating();
		});

		$effect(() => {
			if ((controls.autoRotate = autoRotateCamera)) {
				renderer.setAnimationLoop(
					(animationLoop = () => {
						controls.update();
						render();
					}),
				);

				return () => {
					renderer.setAnimationLoop((animationLoop = null));
				};
			}

			return onOrbitControls(controls, "change", render);
		});

		controls.connect(renderer.domElement);
		return () => {
			controls.disconnect();
			renderer.dispose();
		};
	};
</script>

<Example>
	{#snippet pane()}
		<details open>
			<summary>controls</summary>
			<Label>
				auto rotate camera
				<input
					bind:checked={autoRotateCamera}
					type="checkbox"
				/>
			</Label>
		</details>
	{/snippet}

	<canvas
		class="example-canvas"
		bind:clientWidth={resolution.width}
		bind:clientHeight={resolution.height}
		{@attach attachment}
	>
	</canvas>
</Example>
