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

	type State = "indicating" | "idle";
	let state = $state<State>("indicating");

	type AnimationLoop = Parameters<WebGLRenderer["setAnimationLoop"]>[0];
	let animationLoop: AnimationLoop = null;

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

		$effect(() => {
			renderTarget.setSize(resolution.width, resolution.height);

			renderer.setSize(resolution.width, resolution.height, false);
			renderer.getSize(uResolution.value);

			updateCameraAspect(camera, resolution.width / resolution.height);

			if (animationLoop === null) render();
		});

		const indicatingLoop: AnimationLoop = (time) => {
			time *= 0.001;
			const s = (Math.PI / 16) * Math.sin(time);

			camera.position.set(Math.cos(s), 0, Math.sin(s)).multiplyScalar(5);
			camera.lookAt(mesh.position);
			render();
		};

		$effect(() => {
			switch (state) {
				case "indicating":
					renderer.setAnimationLoop((animationLoop = indicatingLoop));
					const cb = () => {
						state = "idle";
					};

					controls.addEventListener("start", cb);
					return () => {
						controls.removeEventListener("start", cb);
						renderer.setAnimationLoop((animationLoop = null));
					};
				case "idle":
					controls.addEventListener("change", render);
					return () => {
						controls.removeEventListener("change", render);
					};
				default:
					const exhaustive: never = state;
					console.error(exhaustive);
			}
		});

		controls.connect(renderer.domElement);

		return () => {
			controls.disconnect();
			renderer.dispose();
		};
	};
</script>

<canvas
	class="example-canvas"
	bind:clientWidth={resolution.width}
	bind:clientHeight={resolution.height}
	{@attach attachment}
>
</canvas>
