<script
	lang="ts"
	module
>
	const hatZ = new Vector3(0, 0, 1);

	/** just a scratch vector for doing vector math */
	const v = new Vector3();
</script>

<script lang="ts">
	import { getSize } from "@contexts/size";
	import { getWithRenderer } from "@contexts/withRenderer";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import {
		CanvasTexture,
		NearestFilter,
		RepeatWrapping,
		Scene,
		Sprite,
		SpriteMaterial,
		Vector3,
	} from "three";

	let {
		image,
		width,
		height,
		count,
	}: {
		//** image that will be drawn onto the canvas when the controls update the camera
		image: CanvasImageSource;
		/** width of a sprite from the sheet */
		width: number;
		/** height of a sprite from the sheet */
		height: number;
		/** number of sprites in a row of the sheet */
		count: number;
	} = $props();

	const canvas = new OffscreenCanvas(1, 1);

	$effect(() => {
		canvas.width = width;
	});

	$effect(() => {
		canvas.height = height;
	});

	const map = new CanvasTexture(canvas);
	map.minFilter = NearestFilter;
	map.magFilter = NearestFilter;
	map.generateMipmaps = false;
	map.wrapS = RepeatWrapping;
	map.wrapT = RepeatWrapping;

	const material = new SpriteMaterial({
		map,
	});
	const sprite = new Sprite(material);

	const scene = new Scene();
	const add = createAdd(() => scene);
	add(() => sprite);

	$effect(() => {
		return () => {
			material.map = null;
			map.dispose();
			material.dispose();
		};
	});

	const size = getSize();

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 2);

	let lastOffset: number;

	const context = canvas.getContext("2d");
	const withRenderer = getWithRenderer();

	const speed = 0.0025;
	const cameraOrbitRadius = 2;

	withRenderer((renderer) => {
		renderer.setAnimationLoop((time) => {
			if (context === null) return;
			renderer.render(scene, camera);

			const t = speed * time;
			camera.position
				.set(Math.cos(t), 0, Math.sin(t))
				.multiplyScalar(cameraOrbitRadius);
			camera.lookAt(sprite.position);

			// `angleTo` returns the shorter angle between the vectors
			let angle = hatZ.angleTo(v.subVectors(camera.position, sprite.position));

			// the cross product can help determine which angle to use
			// doing all the math to determine which angle to use reduces to this
			if (v.x > 0) {
				angle = 2 * Math.PI - angle;
			}

			const offset = Math.floor(count * (angle / (2 * Math.PI)));

			// only draw when the offset has changed
			if (offset === lastOffset) return;

			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			context.drawImage(
				image,
				width * offset,
				0,
				width,
				height,
				0,
				0,
				width,
				height,
			);

			lastOffset = offset;

			map.needsUpdate = true;
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	});
</script>
