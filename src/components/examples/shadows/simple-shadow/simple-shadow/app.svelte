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

	import { Label } from "@components/controls";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
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

	let shadowColor = $state(`#${shadowMaterial.color.getHexString()}`);
	const getShadowColor = () => shadowColor;
	const setShadowColor = (value: string) => {
		shadowMaterial.color.set((shadowColor = value));
	};

	const canvasSize = new Size();

	$effect(() => {
		updateCameraAspect(camera, canvasSize.ratio);
	});
</script>

<svelte:boundary>
	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}

	<div class="relative">
		<details class="example-pane">
			<summary>controls</summary>
			<Label>
				shadow color
				<input
					type="color"
					bind:value={getShadowColor, setShadowColor}
				/>
			</Label>
		</details>

		<canvas
			class="example-canvas"
			bind:clientWidth={canvasSize.width}
			bind:clientHeight={canvasSize.height}
			{@attach (canvas) => {
				const renderer = createRenderer(
					{
						antialias: true,
						canvas,
					},
					() => canvasSize.width,
					() => canvasSize.height,
				);

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
</svelte:boundary>
