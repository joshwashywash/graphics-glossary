<script
	lang="ts"
	module
>
	const cameraAxis = new Vector3(1, 1, 1).normalize();
	const positionYInitial = 2.5;
	const speed = 1 / 1000;

	const textureCanvasSize = 128;
</script>

<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";
	import { createAttachment } from "./pane";

	import Canvas from "@components/canvas.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import { untrack } from "svelte";
	import {
		CanvasTexture,
		Group,
		Mesh,
		MeshBasicMaterial,
		MeshNormalMaterial,
		PerspectiveCamera,
		PlaneGeometry,
		Scene,
		SphereGeometry,
		Vector3,
	} from "three";
	import type { WebGLRenderer, WebGLRendererParameters } from "three";
	import { lerp } from "three/src/math/MathUtils.js";

	const textureCanvas = new OffscreenCanvas(
		textureCanvasSize,
		textureCanvasSize,
	);

	const context = textureCanvas.getContext("2d");
	// can't really do anything if the context is null so just let the boundary catch the error
	if (context === null) {
		throw new Error("canvas texture context is null");
	}

	let shadowColor = $state("#000000");

	const gradient = $derived(createShadowGradient(context, shadowColor));

	const shadowTexture = new CanvasTexture(textureCanvas);

	$effect(() => {
		context.fillStyle = gradient;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		shadowTexture.needsUpdate = true;
		return () => {
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			shadowTexture.needsUpdate = true;
		};
	});

	const shadowMaterial = new MeshBasicMaterial({
		depthWrite: false,
		map: shadowTexture,
		transparent: true,
	});

	const sphereRadius = 1;

	const sphereDiameter = 2 * sphereRadius;
	const shadowGeometry = new PlaneGeometry(sphereDiameter, sphereDiameter);
	const shadowMesh = new Mesh(shadowGeometry, shadowMaterial);

	shadowMesh.translateZ(0.01);

	const floorSize = 7;
	const floorGeometry = new PlaneGeometry(floorSize, floorSize);

	const floorMaterial = new MeshBasicMaterial({ color: "#ccccaa" });

	const floorMesh = new Mesh(floorGeometry, floorMaterial);

	const disposeFloor = () => {
		floorGeometry.dispose();
		floorMaterial.dispose();
	};

	const group = new Group().add(shadowMesh, floorMesh);
	group.rotateX(-1 * 0.5 * Math.PI);

	const sphereGeometry = new SphereGeometry();
	const sphereMaterial = new MeshNormalMaterial();
	const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);

	const disposeSphere = () => {
		sphereGeometry.dispose();
		sphereMaterial.dispose();
	};

	const scene = new Scene().add(sphereMesh, group);

	onCleanup(() => {
		disposeSphere();
		disposeFloor();
		shadowGeometry.dispose();
		shadowTexture.dispose();
		shadowMaterial.dispose();
	});

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(cameraAxis, 9);
	camera.lookAt(sphereMesh.position);

	const pane = createAttachment({
		get shadowColor() {
			return untrack(() => shadowColor);
		},
		set shadowColor(value) {
			shadowColor = value;
		},
	});

	const onRendererReady = (renderer: WebGLRenderer) => {
		renderer.setAnimationLoop((time) => {
			// convert sin's -1 -> 1 interval to lerp's intervial of 0 -> 1
			const t = 0.5 * (1 + Math.sin(time * speed));

			sphereMesh.position.y = lerp(
				positionYInitial - 1,
				positionYInitial + 1,
				t,
			);
			shadowMesh.scale.setScalar(1 + t);

			shadowMaterial.opacity = lerp(1, 0, t);
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};

	const onRendererResize = (renderer: WebGLRenderer) => {
		const { clientWidth, clientHeight } = renderer.domElement;
		camera.aspect = clientWidth / clientHeight;
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
	};

	const rendererParams: WebGLRendererParameters = {
		antialias: true,
	};
</script>

<svelte:boundary>
	<div class="relative">
		<div
			class="absolute top-2 right-2 not-content"
			{@attach pane}
		></div>
		<Canvas
			class="w-full aspect-square"
			{onRendererReady}
			{onRendererResize}
			{rendererParams}
		/>
	</div>

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>
