<script
	lang="ts"
	module
>
	const hatZ = new Vector3(0, 0, 1);
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

	const size = getSize();

	const camera = createAspectPerspectiveCamera(() => size.aspect);
	camera.position.set(0, 0, 2);

	let lastOffset: number;

	const context = canvas.getContext("2d");

	const controls = new OrbitControls(camera);

	$effect(() => {
		const onChange = () => {
			if (context === null) return;
			let angle = hatZ.angleTo(v.subVectors(camera.position, sprite.position));
			// doing all the math for the cross product to determine orientation reduces to just checking v.x > 0
			if (v.x > 0) {
				angle = 2 * Math.PI - angle;
			}

			const offset = Math.floor(count * (angle / (2 * Math.PI)));

			// only draw when offset has changed
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
