<script
	lang="ts"
	module
>
	const cameraTranslationAxis = new Vector3(1, 1, 1).normalize();
	const positionYInitial = 2.5;
	const speed = 1 / 1000;

	const cameraTranslationAmount = 9;

	const textureCanvasSize = 128;

	const floorSize = 7;

	const sphereRadius = 1;

	const sphereDiameter = 2 * sphereRadius;
</script>

<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";

	import { Size } from "@classes/size.svelte";

	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { setCameraAspect } from "@functions/setCameraAspect";
	import { setRendererSize } from "@functions/setRendererSize.svelte";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import { lerp } from "three/src/math/MathUtils.js";
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
	} from "three/webgpu";
	import { Pane } from "tweakpane";

	const textureCanvas = new OffscreenCanvas(
		textureCanvasSize,
		textureCanvasSize,
	);

	const context = textureCanvas.getContext("2d");
	// can't really do anything if the context is null so just let the boundary catch the error
	if (context === null) {
		throw new Error("canvas texture context is null");
	}

	const gradient = createShadowGradient(context, "#ffffff");
	context.fillStyle = gradient;
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);

	const shadowTexture = useDisposable(CanvasTexture, textureCanvas);

	const shadowMaterial = useDisposable(MeshBasicMaterial, {
		color: "#000000",
		depthWrite: false,
		map: shadowTexture,
		transparent: true,
	});

	const shadowGeometry = useDisposable(
		PlaneGeometry,
		sphereDiameter,
		sphereDiameter,
	);
	const shadowMesh = new Mesh(shadowGeometry, shadowMaterial).translateZ(0.01);

	const floorGeometry = useDisposable(PlaneGeometry, floorSize, floorSize);

	const floorMaterial = useDisposable(MeshBasicMaterial, {
		color: "#ccccaa",
	});

	const floorMesh = new Mesh(floorGeometry, floorMaterial);

	const group = new Group()
		.add(shadowMesh, floorMesh)
		.rotateX(-1 * 0.5 * Math.PI);

	const sphereGeometry = useDisposable(SphereGeometry);
	const sphereMaterial = useDisposable(MeshNormalMaterial);
	const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);

	const scene = new Scene().add(sphereMesh, group);

	const camera = new PerspectiveCamera().translateOnAxis(
		cameraTranslationAxis,
		cameraTranslationAmount,
	);
	camera.lookAt(sphereMesh.position);

	const canvasSize = new Size();

	$effect(() => {
		setCameraAspect(camera, canvasSize.ratio);
	});
</script>

<svelte:boundary>
	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>
<div class="relative">
	<PaneContainer
		{@attach (container) => {
			const pane = useDisposable(Pane, {
				container,
				expanded: false,
				title: "controls",
			});
			pane.addBinding(
				{
					get color() {
						return `#${shadowMaterial.color.getHexString()}`;
					},
					set color(value) {
						shadowMaterial.color.set(value);
					},
				},
				"color",
			);
		}}
		class="absolute top-2 right-2"
	/>

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = createRenderer({
				antialias: true,
				canvas,
			});

			$effect(() => {
				setRendererSize(renderer, canvasSize.width, canvasSize.height);
			});

			renderer.setAnimationLoop((time) => {
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
		}}
	>
	</canvas>
</div>
