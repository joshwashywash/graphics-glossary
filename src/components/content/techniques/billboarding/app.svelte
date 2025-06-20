<script
	lang="ts"
	module
>
	const hatZ = new Vector3(0, 0, 1);

	/** just a scratch vector for doing vector math */
	const scratch = new Vector3();
</script>

<script lang="ts">
	import boo from "@assets/boo.png";

	import { renderer } from "@attachments/renderer.svelte";

	import Size from "@classes/Size.svelte";

	import Example from "@components/example.svelte";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createUpdateCameraAspect } from "@functions/createUpdateCameraAspect.svelte";
	import { loadImage } from "@functions/loadImage";

	import {
		CanvasTexture,
		NearestFilter,
		PerspectiveCamera,
		RepeatWrapping,
		Scene,
		Sprite,
		SpriteMaterial,
		Vector3,
	} from "three";

	const promise = loadImage(boo.src, boo.width, boo.height);

	const count = 35;

	const width = boo.width / count;

	const canvas = new OffscreenCanvas(width, boo.height);

	const map = new CanvasTexture(canvas);
	map.minFilter = NearestFilter;
	map.magFilter = NearestFilter;
	map.generateMipmaps = false;
	map.wrapS = RepeatWrapping;
	map.wrapT = RepeatWrapping;

	const material = new SpriteMaterial({
		map,
	});

	$effect(() => {
		return () => {
			material.map = null;
			map.dispose();
			material.dispose();
		};
	});

	const scene = new Scene();
	const addToScene = createAdd(() => scene);

	const sprite = new Sprite(material);
	addToScene(() => sprite);

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

<Example>
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

							const t = speed * time;
							camera.position
								.set(Math.cos(t), 0, Math.sin(t))
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

							const offset = Math.floor(count * (angle / (2 * Math.PI)));

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
</Example>
