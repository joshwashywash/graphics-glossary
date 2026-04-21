<script
	module
	lang="ts"
>
	const loader = new TextureLoader().setPath("/cubemaps/Lycksele/");
	const files = [
		"posx.jpg",
		"negx.jpg",
		"posy.jpg",
		"negy.jpg",
		"posz.jpg",
		"negz.jpg",
	] as const;

	const SPY_CAMERA_TRANSLATION_AXIS = new Vector3(1, 0.5, 1).normalize();

	const speed = 1 / 4000;
	const amplitudeY = 0.3;
</script>

<script lang="ts">
	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createDisposed } from "@functions/createDisposed.svelte";
	import { createRenderer } from "@functions/createRenderer.svelte";
	import { onCleanup } from "@functions/onCleanup.svelte";
	import { resize } from "@functions/resize.svelte";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import {
		BackSide,
		BoxGeometry,
		CameraHelper,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		Scene,
		TextureLoader,
		Vector3,
	} from "three/webgpu";
	import { Pane } from "tweakpane";

	const geometry = createDisposed(BoxGeometry);
	const textures = await Promise.all(files.map((url) => loader.loadAsync(url)));
	onCleanup(() => {
		for (const texture of textures) texture.dispose();
	});

	const materials = textures.map((texture) =>
		createDisposed(MeshBasicMaterial, {
			depthWrite: false,
			map: texture,
			side: BackSide,
		}),
	);

	const sceneCamera = new PerspectiveCamera(45, 1, 0.1, 1);

	const cube = new Mesh(geometry, materials);
	const helper = createDisposed(CameraHelper, sceneCamera);
	helper.renderOrder += 1;
	helper.visible = false;

	const spyCamera = new PerspectiveCamera().translateOnAxis(
		SPY_CAMERA_TRANSLATION_AXIS,
		3,
	);

	const scene = new Scene().add(cube, helper);
	spyCamera.lookAt(scene.position);

	const context = {
		_camera: sceneCamera,
		get showAll() {
			return this._camera === spyCamera;
		},
		set showAll(value) {
			this._camera = value ? spyCamera : sceneCamera;
			helper.visible = value;
			controls.enabled = value;
		},
	};

	const controls = createDisposed(OrbitControls, spyCamera);
</script>

<div class="relative">
	<PaneContainer
		class="absolute top-2 right-2"
		{@attach (container) => {
			createDisposed(Pane, {
				container,
				title: "controls",
			}).addBinding(context, "showAll", {
				label: "show all",
			});
		}}
	/>
	<canvas
		class="aspect-video"
		{@attach (canvas) => {
			const renderer = createRenderer({
				antialias: true,
				canvas,
			});

			renderer.setAnimationLoop((time) => {
				const canvas = renderer.domElement;
				if (resize(renderer)) {
					const aspect = canvas.clientWidth / canvas.clientHeight;
					setCameraAspect(spyCamera, aspect);
					setCameraAspect(sceneCamera, aspect);
				}

				time *= speed;
				const c = Math.cos(time);
				sceneCamera.lookAt(c, amplitudeY * c, Math.sin(time));
				if (helper.visible) helper.update();

				renderer.render(scene, context._camera);
			});

			controls.connect(renderer.domElement);
			return () => {
				controls.disconnect();
			};
		}}
	></canvas>
</div>
