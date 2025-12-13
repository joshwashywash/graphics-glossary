<script
	lang="ts"
	module
>
	const degrees = 1;
	const angle = DEG2RAD * degrees;

	const POWER_MIN = 0;
	const POWER_MAX = 3;
	const POWER_STEP = 0.5;
</script>

<script lang="ts">
	import { Size } from "@classes/size.svelte";

	import { Label } from "@components/controls";
	import Example from "@components/examples/example.svelte";

	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useCleanup } from "@functions/useCleanup.svelte";

	import { DEG2RAD } from "three/src/math/MathUtils.js";
	import {
		Fn,
		normalWorld,
		positionViewDirection,
		sub,
		uniform,
	} from "three/tsl";
	import {
		Color,
		Mesh,
		MeshBasicNodeMaterial,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
		WebGPURenderer,
	} from "three/webgpu";

	let rotateMesh = $state(true);

	const baseColorUniform = uniform(new Color());
	const fresnelColorUniform = uniform(new Color());
	const powerUniform = uniform(0);

	const material = new MeshBasicNodeMaterial();
	material.colorNode = Fn(() => {
		const f = normalWorld.dot(positionViewDirection).add(1.0).mul(0.5);
		const fresnel = f.pow(powerUniform).mul(baseColorUniform);
		const inverseFresnel = sub(1.0, f)
			.pow(powerUniform)
			.mul(fresnelColorUniform);
		return fresnel.add(inverseFresnel);
	})();

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
	let power = $state(0.5 * (POWER_MAX - POWER_MIN));

	const canvasSize = new Size();

	let animationLoop: null | (() => void) = null;
</script>

<Example>
	{#snippet pane()}
		<details open>
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
		{@attach (canvas) => {
			const renderer = new WebGPURenderer({
				antialias: true,
				canvas,
			});

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

			const promise = renderer.init().then((renderer) => {
				return $effect.root(() => {
					$effect(() => {
						renderer.setSize(canvasSize.width, canvasSize.height, false);

						const aspect = canvasSize.width / canvasSize.height;

						updateCameraAspect(camera, aspect);

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
			});

			return () => {
				renderer.dispose();
				promise.then((cleanup) => cleanup());
			};
		}}
	>
	</canvas>
</Example>
