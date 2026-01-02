<script
	lang="ts"
	module
>
	const degrees = 1;
	const angle = DEG2RAD * degrees;

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

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { DEG2RAD } from "three/src/math/MathUtils.js";
	import { normalWorld, positionViewDirection, uniform } from "three/tsl";
	import {
		Color,
		Mesh,
		MeshBasicNodeMaterial,
		PerspectiveCamera,
		TorusKnotGeometry,
		WebGPURenderer,
	} from "three/webgpu";

	const baseColorUniform = uniform(new Color("#583583")).setName("baseColor");
	const fresnelColorUniform = uniform(new Color("#ccccaa")).setName(
		"fresnelColor",
	);
	const powerUniform = uniform(POWER_DEFAULT).setName("power");

	const fresnel = f.pow(powerUniform).mul(baseColorUniform).setName("fresnel");
	const inverseFresnel = f
		.oneMinus()
		.pow(powerUniform)
		.mul(fresnelColorUniform)
		.setName("inverseFresnel");

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
	let fresnelColor = $state(`#${fresnelColorUniform.value.getHexString()}`);
	let power = $state(powerUniform.value);

	const canvasSize = new Size();
</script>

<div class="relative">
	<details class="example-pane">
		<summary>controls</summary>
		<Label>
			base color
			<input
				type="color"
				bind:value={
					() => baseColor,
					(value) => {
						baseColorUniform.value.set(value);
						baseColor = value;
					}
				}
			/>
		</Label>
		<Label>
			fresnel color
			<input
				type="color"
				bind:value={
					() => fresnelColor,
					(value) => {
						fresnelColorUniform.value.set(value);
						fresnelColor = value;
					}
				}
			/>
		</Label>
		<Label>
			power
			<input
				type="range"
				bind:value={
					() => power,
					(value) => {
						powerUniform.value = value;
						power = value;
					}
				}
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

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height, false);
				updateCameraAspect(camera, canvasSize.ratio);
			});

			renderer.setAnimationLoop(() => {
				mesh.rotateY(angle);
				renderer.render(mesh, camera);
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
