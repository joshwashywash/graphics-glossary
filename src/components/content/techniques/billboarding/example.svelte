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

	const spriteCount = 18;

	/**
	 * number of steps for a full 360 rotation
	 *
	 * the first and last sprites are not included in the last half of the rotation
	 *
	 * one row + one row - the first and last sprites on the way back
	 * 2 * spriteCount - 2 =>
	 * 2 * (spriteCount - 1)
	 **/
	const stepCount = 2 * (spriteCount - 1);
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

	booCanvasContext.scale(-1, 1);

	const createWithRenderer = (image: HTMLImageElement): WithRenderer => {
		let lastOffset: number;
		return (renderer) => {
			renderer.setAnimationLoop((time) => {
				renderer.render(scene, camera);

				// slow it down
				time *= cameraRotationSpeed;
				time += 0.5 * Math.PI;

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

				const o = Math.floor(stepCount * (angle / tau));
				let offset = o;
				if (o >= spriteCount) {
					// start at the second to last sprite since the last sprite, spriteCount - 1, is included in the "front" rotation
					offset = spriteCount - 2 - (o % spriteCount);
				}

				if (lastOffset === offset) return;

				lastOffset = offset;

				booCanvasContext.resetTransform();
				const s = angle > Math.PI ? -1 : 1;
				booCanvasContext.scale(s, 1);

				booCanvasContext.clearRect(
					0,
					0,
					s * booCanvasContext.canvas.width,
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
					s * spriteWidth,
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
