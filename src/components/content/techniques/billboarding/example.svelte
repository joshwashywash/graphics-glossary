<script
	lang="ts"
	module
>
	const hatZ = new Vector3(0, 0, 1);

	/** just a scratch vector */
	const scratch = new Vector3();

	const cameraOrbitRadius = 2;
	const cameraRotationSpeed = 0.0025;

	const tau = 2 * Math.PI;

	const spriteCount = 35;
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
		PerspectiveCamera,
		Scene,
		Sprite,
		SpriteMaterial,
		Vector3,
	} from "three";

	const booCanvas = new OffscreenCanvas(spriteWidth, boo.height);
	const booCanvasContext = booCanvas.getContext("2d");

	// the example can not work without this so just throw and let the boundary handle it
	if (booCanvasContext === null) {
		throw new Error("texture context is null");
	}

	const promise = loadImage(boo.src, boo.width, boo.height);

	const size = new Size();

	const camera = new PerspectiveCamera();
	camera.position.set(0, 0, 3);

	const updateCameraAspect = createUpdateCameraAspect(camera);

	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const canvasTexture = createCanvasTexture(booCanvas);

	const material = new SpriteMaterial({
		map: canvasTexture,
	});

	const sprite = new Sprite(material);

	const scene = new Scene().add(sprite);

	$effect(() => {
		return () => {
			scene.remove(sprite);
			material.map = null;
			canvasTexture.dispose();
			material.dispose();
		};
	});

	const createWithRenderer = (image: HTMLImageElement): WithRenderer => {
		let lastOffset: number;
		return (renderer) => {
			renderer.setAnimationLoop((time) => {
				renderer.render(scene, camera);

				// slow it down
				time *= cameraRotationSpeed;
				camera.position
					.set(Math.cos(time), 0, Math.sin(time))
					.multiplyScalar(cameraOrbitRadius);
				camera.lookAt(sprite.position);

				// `angleTo` returns the shorter angle between the vectors
				let angle = hatZ.angleTo(
					scratch.subVectors(camera.position, sprite.position),
				);

				// the cross product can help determine which angle to use
				// doing all the math to determine which angle to use reduces to this
				if (scratch.x > 0) {
					angle = tau - angle;
				}

				const offset = Math.floor(spriteCount * (angle / tau));

				// only draw when the offset has changed
				if (offset === lastOffset) return;

				lastOffset = offset;

				booCanvasContext.clearRect(
					0,
					0,
					booCanvasContext.canvas.width,
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
					spriteWidth,
					boo.height,
				);

				canvasTexture.needsUpdate = true;
			});

			return () => {
				renderer.setAnimationLoop(null);
			};
		};
	};
</script>

<div bind:clientWidth={size.width}>
	{#await promise then image}
		{@const withRenderer = createWithRenderer(image)}
		<canvas
			{@attach renderer(
				() => size.width,
				() => size.height,
				() => withRenderer,
			)}
		>
		</canvas>
	{/await}
</div>
