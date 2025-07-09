<script
	lang="ts"
	module
>
	const hatZ = new Vector3(0, 0, 1);

	/** just a scratch vector */
	const scratch = new Vector3();

	const cameraNear = 1;
	const cameraFar = 3;
	const cameraOrbitRadius = cameraFar - cameraNear;
	const cameraRotationSpeed = 0.0025 * 0.5;

	const tau = 2 * Math.PI;

	const spriteCount = 18;

	/**
	 * number of sprites to show during the second half of the rotation
	 * equal to `spriteCount` minus the first and last
	 */
	const backwardsSpriteCount = spriteCount - 2;

	const stepCount = spriteCount + backwardsSpriteCount;

	const spriteWidth = boo.width / spriteCount;
</script>

<script lang="ts">
	import { createCanvasTexture } from "./createCanvasTexture";

	import boo from "@assets/boo.png";

	import type { WithRenderer } from "@attachments/renderer.svelte";
	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";
	import { loadImage } from "@functions/loadImage";

	import {
		Camera,
		CameraHelper,
		Mesh,
		MeshBasicMaterial,
		PerspectiveCamera,
		PlaneGeometry,
		Scene,
		Sprite,
		SpriteMaterial,
		Vector3,
	} from "three";

	let { renderVisualizationScene = false } = $props();

	const booCanvas = new OffscreenCanvas(spriteWidth, boo.height);
	const booCanvasContext = booCanvas.getContext("2d");

	// the example can not work without this so just throw and let the boundary handle it
	if (booCanvasContext === null) {
		throw new Error("texture context is null");
	}

	const canvasTexture = createCanvasTexture(booCanvas);

	const camera = new PerspectiveCamera(45, 1, cameraNear, cameraFar);

	const planeGeometry = new PlaneGeometry();
	const planeMaterial = new MeshBasicMaterial({
		map: canvasTexture,
	});
	const plane = new Mesh(planeGeometry, planeMaterial);

	const visualizationCamera = new PerspectiveCamera();

	visualizationCamera.position.set(0, 2, 4);
	visualizationCamera.lookAt(plane.position);

	const cameraHelper = new CameraHelper(camera);
	const visualizationScene = new Scene().add(plane, cameraHelper);

	const spriteMaterial = new SpriteMaterial({
		map: canvasTexture,
	});

	const sprite = new Sprite(spriteMaterial);

	const scene = new Scene().add(sprite);

	$effect(() => {
		return () => {
			visualizationScene.remove(plane, cameraHelper);
			planeGeometry.dispose();
			planeMaterial.map = null;
			planeMaterial.dispose();

			scene.remove(sprite);
			spriteMaterial.map = null;
			spriteMaterial.dispose();

			canvasTexture.dispose();
		};
	});

	const updateCameraAspect = createUpdateCameraAspect(camera);
	const updateVisualizationCameraAspect =
		createUpdateCameraAspect(visualizationCamera);

	const updateAspects = (aspect: number) => {
		updateCameraAspect(aspect);
		updateVisualizationCameraAspect(aspect);
	};

	$effect(() => {
		updateAspects(size.aspect);
		// updating the camera aspect this way updates the camera's projection matrix which the helper doesn't know about
		cameraHelper.update();
	});

	// these don't need to states since they're read in the render loop
	let currentCamera: Camera;
	let currentScene: Scene;

	$effect(() => {
		if (renderVisualizationScene) {
			currentCamera = visualizationCamera;
			currentScene = visualizationScene;
		} else {
			currentCamera = camera;
			currentScene = scene;
		}
	});

	const createWithRenderer = (image: HTMLImageElement): WithRenderer => {
		let lastOffset: number;
		return (renderer) => {
			renderer.setAnimationLoop((time) => {
				renderer.render(currentScene, currentCamera);

				// slow it down
				time = cameraRotationSpeed * time + 0.5 * Math.PI;

				camera.position
					.set(Math.cos(time), 0, Math.sin(time))
					.multiplyScalar(cameraOrbitRadius);
				camera.lookAt(sprite.position);

				// `angleTo` returns the shorter angle between the vectors
				let angle = hatZ.angleTo(
					scratch.subVectors(camera.position, sprite.position),
				);

				// the cross product can help determine which angle to use
				// the math to determine which angle to use reduces down to this
				if (scratch.x > 0) {
					angle = tau - angle;
				}

				let offset = Math.floor(stepCount * (angle / tau));

				const behind = offset >= spriteCount;
				const directionX = 1 - 2 * +behind;

				if (behind) {
					offset = backwardsSpriteCount - (offset % spriteCount);
				}

				if (lastOffset === offset) return;

				plane.lookAt(camera.position);
				plane.rotateY(
					0.5 *
						(1 - Math.sign(camera.position.dot(visualizationCamera.position))) *
						Math.PI,
				);

				booCanvasContext.resetTransform();
				booCanvasContext.scale(directionX, 1);

				booCanvasContext.clearRect(
					0,
					0,
					directionX * booCanvasContext.canvas.width,
					booCanvasContext.canvas.height,
				);

				booCanvasContext.drawImage(
					image,
					booCanvasContext.canvas.width * offset,
					0,
					spriteWidth,
					boo.height,
					0,
					0,
					directionX * spriteWidth,
					boo.height,
				);

				canvasTexture.needsUpdate = true;

				lastOffset = offset;
			});

			return () => {
				renderer.setAnimationLoop(null);
			};
		};
	};

	const size = new Size();

	let withRenderer: WithRenderer = $state(() => {});
	loadImage(boo.src, boo.width, boo.height).then((image) => {
		withRenderer = createWithRenderer(image);
	});
</script>

<div bind:clientWidth={size.width}>
	<canvas
		{@attach renderer(
			() => size.width,
			() => size.height,
			() => withRenderer,
		)}
	>
	</canvas>
</div>
