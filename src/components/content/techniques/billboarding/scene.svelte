<script lang="ts">
	import { getSize } from "@contexts/size";
	import { getWithRenderer } from "@contexts/withRenderer";

	import { createAdd } from "@functions/createAdd.svelte";
	import { createAspectPerspectiveCamera } from "@functions/createAspectPerspectiveCamera.svelte";

	import {
		CanvasTexture,
		MathUtils,
		NearestFilter,
		RepeatWrapping,
		Scene,
		Sprite,
		SpriteMaterial,
	} from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

	const context = canvas.getContext("2d");

	const size = getSize();

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 2);

	const controls = new OrbitControls(camera);

	let lastOffset: number;

	$effect(() => {
		const onChange = () => {
			if (context === null) return;
			let angle = controls.getAzimuthalAngle();
			angle += +(Math.sign(angle) < 0) * Math.PI;
			const offset = MathUtils.clamp(
				Math.floor(count * (angle / Math.PI)),
				0,
				count - 1,
			);

			if (offset === lastOffset) return;
			lastOffset = offset;

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

			map.needsUpdate = true;
		};

		onChange();

		controls.addEventListener("change", onChange);

		return () => {
			controls.removeEventListener("change", onChange);
		};
	});

	const withRenderer = getWithRenderer();

	withRenderer((renderer) => {
		controls.connect(renderer.domElement);
		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
			controls.disconnect();
		};
	});
</script>
