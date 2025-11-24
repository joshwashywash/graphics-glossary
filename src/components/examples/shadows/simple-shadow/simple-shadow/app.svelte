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

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

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
		WebGLRenderer,
	} from "three";
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

	const gradient = createShadowGradient(context, "#ffffff");
	context.fillStyle = gradient;
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);

	const shadowTexture = new CanvasTexture(textureCanvas);

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

	useCleanup(() => {
		disposeSphere();
		disposeFloor();
		shadowGeometry.dispose();
		shadowTexture.dispose();
		shadowMaterial.dispose();
	});

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(cameraAxis, 9);
	camera.lookAt(sphereMesh.position);

	$effect(() => {
		shadowMaterial.color.set(shadowColor);
	});
</script>

<svelte:boundary>
	{#snippet failed(error)}
		<p>{error}</p>
	{/snippet}

	<Example>
		{#snippet pane()}
			<details open>
				<summary>controls</summary>
				<Label>
					shadow color
					<input
						type="color"
						bind:value={shadowColor}
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
					const { clientHeight, clientWidth, height, width } =
						renderer.domElement;
					if (clientHeight !== height || clientWidth !== width) {
						renderer.setSize(clientWidth, clientHeight, false);
						updateCameraAspect(camera, clientWidth / clientHeight);
					}
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
					renderer.dispose();
				};
			}}
		>
		</canvas>
	</Example>
</svelte:boundary>
