<script
	lang="ts"
	module
>
	const _cameraAxis = new Vector3(1, 1, 1).normalize();
</script>

<script lang="ts">
	import { createShadowGradient } from "../createShadowGradient";
	import { createFloorMesh } from "./createFloorMesh";
	import { createSphereMesh } from "./createSphereMesh";

	import {
		State,
		createRendererAttachment,
	} from "@attachments/createRendererAttachment.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";

	import { Color, Pane } from "svelte-tweakpane-ui";
	import {
		CanvasTexture,
		Group,
		MathUtils,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		PlaneGeometry,
		Scene,
		Vector3,
	} from "three";

	const textureCanvasSize = 128;
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

	$effect(() => {
		context.fillStyle = gradient;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		shadowMap.needsUpdate = true;
		return () => {
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			shadowMap.needsUpdate = true;
		};
	});

	const shadowMap = new CanvasTexture(textureCanvas);
	const shadowMaterial = new MeshBasicMaterial({
		depthWrite: false,
		map: shadowMap,
		transparent: true,
	});

	const sphereRadius = 1;

	const sphereDiameter = 2 * sphereRadius;
	const shadowGeometry = new PlaneGeometry(sphereDiameter, sphereDiameter);
	const shadowMesh = new Mesh(shadowGeometry, shadowMaterial);

	shadowMesh.translateZ(0.01);

	const floorSize = 7;
	const { dispose: disposeFloor, mesh: floorMesh } = createFloorMesh(
		floorSize,
		{ color: "#ccccaa" },
	);

	const group = new Group().add(shadowMesh, floorMesh);
	group.rotateX(-1 * 0.5 * Math.PI);

	const { dispose: disposeSphere, mesh: sphereMesh } = createSphereMesh(1);

	const scene = new Scene().add(sphereMesh, group);

	$effect(() => {
		return () => {
			for (const child of scene.children) child.removeFromParent();
			for (const child of group.children) child.removeFromParent();

			disposeSphere();
			disposeFloor();
			shadowGeometry.dispose();
			shadowMap.dispose();
			shadowMaterial.dispose();
		};
	});

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(_cameraAxis, 12);
	camera.lookAt(sphereMesh.position);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	const s = new State();
	$effect(() => {
		updateCameraAspect(s.aspect);
	});

	const positionYInitial = 2.5;
	const speed = 1 / 1000;

	s.withRenderer = (renderer) => {
		renderer.setAnimationLoop((time) => {
			time *= speed;

			// convert sin's -1 -> 1 interval to lerp's intervial of 0 -> 1
			const t = 0.5 * (1 + Math.sin(time));

			sphereMesh.position.y = MathUtils.lerp(
				positionYInitial - 1,
				positionYInitial + 1,
				t,
			);
			shadowMesh.scale.setScalar(1 + t);

			shadowMaterial.opacity = MathUtils.lerp(1, 0, t);
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<svelte:boundary>
	<div
		bind:clientWidth={s.canvasWidth}
		class="sm:relative"
	>
		<div class="sm:absolute sm:bottom-4 sm:right-4 not-content">
			<Pane position="inline">
				<Color
					bind:value={shadowColor}
					label="shadow color"
				/>
			</Pane>
		</div>
		<canvas {@attach createRendererAttachment(s)}></canvas>
	</div>

	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}
</svelte:boundary>
