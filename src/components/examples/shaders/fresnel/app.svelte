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
	import { createRendererAttachment } from "@attachments/createRendererAttachment.svelte";

	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import resize from "@functions/resize";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { DEG2RAD } from "three/src/math/MathUtils.js";
	import { normalWorld, positionViewDirection, uniform } from "three/tsl";
	import {
		Color,
		Mesh,
		MeshBasicNodeMaterial,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
	} from "three/webgpu";

	let rotateMesh = $state(true);

	const baseColorUniform = uniform(new Color()).setName("baseColor");
	const fresnelColorUniform = uniform(new Color()).setName("fresnelColor");
	const powerUniform = uniform(0).setName("power");

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

	const scene = new Scene().add(mesh);

	const camera = new PerspectiveCamera().translateZ(5);

	let baseColor = $state("#583583");

	let fresnelColor = $state("#ccccaa");
	let power = $state(POWER_DEFAULT);

	const canvasSize = new Size();

	let animationLoop: null | (() => void) = null;

	const attachment = createRendererAttachment((renderer) => {
		const render = () => {
			renderer.render(scene, camera);
		};

		const renderIfNotAnimating = () => {
			if (animationLoop === null) render();
		};

		const loop = () => {
			mesh.rotateY(angle);
			render();
		};

		$effect(() => {
			resize(renderer, camera, canvasSize);
			renderIfNotAnimating();
		});

		$effect(() => {
			baseColorUniform.value.setStyle(baseColor);
			renderIfNotAnimating();
		});

		$effect(() => {
			fresnelColorUniform.value.setStyle(fresnelColor);
			renderIfNotAnimating();
		});

		$effect(() => {
			powerUniform.value = power;
			renderIfNotAnimating();
		});

		$effect(() => {
			if (rotateMesh) {
				renderer.setAnimationLoop((animationLoop = loop));
				return () => {
					renderer.setAnimationLoop((animationLoop = null));
				};
			}
		});
	});
</script>

<Example>
	{#snippet pane()}
		<details>
			<summary>controls</summary>
			<Label>
				base color
				<input
					type="color"
					bind:value={baseColor}
				/>
			</Label>
			<Label>
				fresnel color
				<input
					type="color"
					bind:value={fresnelColor}
				/>
			</Label>
			<Label>
				power
				<input
					type="range"
					bind:value={power}
					min={POWER_MIN}
					max={POWER_MAX}
					step={POWER_STEP}
				/>
			</Label>
			<Label>
				rotate mesh
				<input
					type="checkbox"
					bind:checked={rotateMesh}
				/>
			</Label>
		</details>
	{/snippet}

	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach attachment}
	>
	</canvas>
</Example>
