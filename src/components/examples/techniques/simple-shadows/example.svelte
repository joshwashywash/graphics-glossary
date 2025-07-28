<script
	lang="ts"
	module
>
	const removeAllChildren = (object: Object3D) => {
		for (const child of object.children) {
			child.removeFromParent();
		}
	};
</script>

<script lang="ts">
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import type { Attachment } from "svelte/attachments";
	import { devicePixelRatio } from "svelte/reactivity/window";
	import {
		Camera,
		CanvasTexture,
		Group,
		Mesh,
		MeshBasicMaterial,
		MeshNormalMaterial,
		Object3D,
		PerspectiveCamera,
		PlaneGeometry,
		Scene,
		SphereGeometry,
		WebGLRenderer,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	let {
		canvasWidth = 1,
		canvasHeight = 1,
		aspect = canvasWidth / canvasHeight,
	} = $props();

	const textureCanvasSize = 128;

	const textureCanvas = new OffscreenCanvas(
		textureCanvasSize,
		textureCanvasSize,
	);

	const context = textureCanvas.getContext("2d");

	// can't really do anything if the conext is null so just let the boundary catch the error
	if (context === null) {
		throw new Error("canvas texture context is null");
	}

	const textureCanvasHalfSize = 0.5 * textureCanvasSize;
	const gradient = context.createRadialGradient(
		textureCanvasHalfSize,
		textureCanvasHalfSize,
		0,
		textureCanvasHalfSize,
		textureCanvasHalfSize,
		textureCanvasHalfSize,
	);
	gradient.addColorStop(0, "black");
	gradient.addColorStop(1, "rgba(0,0,0,0)");
	context.fillStyle = gradient;
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);

	const sphereRadius = 1;
	const sphereGeometry = new SphereGeometry(sphereRadius);
	const sphereMaterial = new MeshNormalMaterial();

	const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);
	sphereMesh.position.y = 2;

	const texture = new CanvasTexture(textureCanvas);

	const sphereDiameter = 2 * sphereRadius;

	const shadowGeometry = new PlaneGeometry(sphereDiameter, sphereDiameter);
	const shadowMaterial = new MeshBasicMaterial({
		depthWrite: false,
		transparent: true,
		opacity: 0.5,
		map: texture,
		polygonOffset: true,
		polygonOffsetFactor: -1,
	});

	const shadowMesh = new Mesh(shadowGeometry, shadowMaterial);

	const floorMaterial = new MeshBasicMaterial();

	const floorSize = 6;
	const floorGeometry = new PlaneGeometry(floorSize, floorSize);
	const floorMesh = new Mesh(floorGeometry, floorMaterial);

	const group = new Group().add(shadowMesh, floorMesh);
	group.rotateX(-1 * 0.5 * Math.PI);

	const scene = new Scene().add(sphereMesh, group);

	$effect(() => {
		return () => {
			removeAllChildren(scene);
			removeAllChildren(group);

			sphereGeometry.dispose();
			sphereMaterial.dispose();

			floorGeometry.dispose();
			floorMaterial.dispose();

			shadowGeometry.dispose();
			shadowMaterial.dispose();

			texture.dispose();
		};
	});

	const camera = new PerspectiveCamera();
	camera.position.setScalar(4);
	camera.lookAt(sphereMesh.position);
	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(aspect);
	});

	const pixelRatio = $derived(devicePixelRatio.current ?? 1);

	const controls = new OrbitControls(camera);

	const f = (
		getWidth: () => number,
		getHeight: () => number,
		getPixelRatio: () => number,
	): Attachment<HTMLCanvasElement> => {
		return (canvas) => {
			const renderer = new WebGLRenderer({
				antialias: true,
				canvas,
			});

			const render = () => {
				renderer.render(scene, camera);
			};

			controls.addEventListener("change", render);
			controls.connect(renderer.domElement);

			$effect(() => {
				renderer.setSize(getWidth(), getHeight());
			});

			$effect(() => {
				renderer.setPixelRatio(getPixelRatio());
			});

			return () => {
				controls.removeEventListener("change", render);
				controls.disconnect();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		};
	};
</script>

<canvas
	{@attach f(
		() => canvasWidth,
		() => canvasHeight,
		() => pixelRatio,
	)}
>
</canvas>
