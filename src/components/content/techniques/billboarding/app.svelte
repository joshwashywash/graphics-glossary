<script
	module
	lang="ts"
>
	const hatZ = new Vector3(0, 0, 1);

	/** just a scratch vector for doing vector math */
	const scratch = new Vector3();
</script>

<script lang="ts">
	import { createSprite } from "./createSprite";

	import boo from "@assets/boo.png";

	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";
	import { loadImage } from "@functions/loadImage";

	import { PerspectiveCamera, Scene, Vector3 } from "three";

	const promise = loadImage(boo.src, boo.width, boo.height);

	const spriteCount = 35;

	const width = boo.width / spriteCount;

	const scene = new Scene();
	const addToScene = createAdd(() => scene);

	const { canvas, dispose, map, sprite } = createSprite(width, boo.height);
	addToScene(() => sprite);

	$effect(() => {
		return dispose;
	});

	const size = new Size();

	const camera = new PerspectiveCamera();
	const updateCameraAspect = createUpdateCameraAspect(camera);
	camera.position.set(0, 0, 3);

	$effect(() => {
		updateCameraAspect(size.aspect);
	});

	const speed = 0.0025;
	const cameraOrbitRadius = 2;

	const context = canvas.getContext("2d");

	let lastOffset: number;
</script>

<div bind:clientWidth={size.width}>
	{#await promise then image}
		<canvas
			{@attach renderer(
				() => size.width,
				() => size.height,
				(renderer) => {
					renderer.setAnimationLoop((time) => {
						if (context === null) return;
						renderer.render(scene, camera);

						// slow it down
						time *= speed;
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
							angle = 2 * Math.PI - angle;
						}

						const offset = Math.floor(spriteCount * (angle / (2 * Math.PI)));

						// only draw when the offset has changed
						if (offset === lastOffset) return;

						context.clearRect(
							0,
							0,
							context.canvas.width,
							context.canvas.height,
						);
						context.drawImage(
							image,
							width * offset,
							0,
							width,
							boo.height,
							0,
							0,
							width,
							boo.height,
						);

						lastOffset = offset;

						map.needsUpdate = true;
					});
				},
			)}
		>
		</canvas>
	{/await}
</div>
