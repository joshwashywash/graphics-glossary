<script
	lang="ts"
	module
>
	const POWER_MIN = 0;
	const POWER_MAX = 3;
	const POWER_STEP = 0.5;

	const POWER_DIFF = POWER_MAX - POWER_MIN;
	const POWER_DEFAULT = 0.5 * POWER_DIFF;

	const f = normalWorld.dot(positionViewDirection).abs().setName("factor");
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";

	import { setPixelRatio } from "@functions/setPixelRatio.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { normalWorld, positionViewDirection, uniform } from "three/tsl";
	import {
		Color,
		Mesh,
		MeshBasicNodeMaterial,
		PerspectiveCamera,
		TorusKnotGeometry,
		WebGPURenderer,
	} from "three/webgpu";

	const baseColorUniform = uniform(new Color("#583583"));
	const fresnelColorUniform = uniform(new Color("#ccccaa"));
	const powerUniform = uniform(POWER_DEFAULT);

	const fresnel = f.pow(powerUniform).mul(baseColorUniform);
	const inverseFresnel = f
		.oneMinus()
		.pow(powerUniform)
		.mul(fresnelColorUniform);

	const material = new MeshBasicNodeMaterial();
	material.colorNode = fresnel.add(inverseFresnel);

	const geometry = new TorusKnotGeometry();

	useCleanup(() => {
		material.dispose();
		geometry.dispose();
	});

	const mesh = new Mesh(geometry, material);

	const camera = new PerspectiveCamera().translateZ(5);

	let baseColor = $state(`#${baseColorUniform.value.getHexString()}`);
	const getBaseColor = () => baseColor;
	const setBaseColor = (value: string) => {
		baseColorUniform.value.set((baseColor = value));
	};

	let fresnelColor = $state(`#${fresnelColorUniform.value.getHexString()}`);
	const getFresnelColor = () => fresnelColor;
	const setFresnelColor = (value: string) => {
		fresnelColorUniform.value.set((fresnelColor = value));
	};

	let power = $state(powerUniform.value);
	const getPower = () => power;
	const setPower = (value: number) => {
		power = powerUniform.value = value;
	};

	const canvasSize = new Size();
</script>

<div class="relative">
	<details class="example-pane">
		<summary>controls</summary>
		<Label>
			base color
			<input
				type="color"
				bind:value={getBaseColor, setBaseColor}
			/>
		</Label>
		<Label>
			fresnel color
			<input
				type="color"
				bind:value={getFresnelColor, setFresnelColor}
			/>
		</Label>
		<Label>
			power
			<input
				type="range"
				bind:value={getPower, setPower}
				min={POWER_MIN}
				max={POWER_MAX}
				step={POWER_STEP}
			/>
		</Label>
	</details>

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = new WebGPURenderer({
				antialias: true,
				canvas,
			});

			setPixelRatio(() => renderer);

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);
				updateCameraAspect(camera, canvasSize.ratio);
			});

			const controls = new OrbitControls(camera, renderer.domElement);
			controls.autoRotate = true;

			renderer.setAnimationLoop(() => {
				controls.update();
				renderer.render(mesh, camera);
			});

			return () => {
				controls.dispose();
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
