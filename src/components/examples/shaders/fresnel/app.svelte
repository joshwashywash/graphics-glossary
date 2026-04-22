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
	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createDisposed } from "@functions/createDisposed.svelte";
	import { createRenderer } from "@functions/createRenderer.svelte";
	import { resize } from "@functions/resize.svelte";
	import { setCameraAspect } from "@functions/setCameraAspect";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { normalWorld, positionViewDirection, uniform } from "three/tsl";
	import {
		Color,
		Mesh,
		MeshBasicNodeMaterial,
		PerspectiveCamera,
		TorusKnotGeometry,
	} from "three/webgpu";
	import { Pane } from "tweakpane";

	const baseColorUniform = uniform(new Color("#583583"));
	const fresnelColorUniform = uniform(new Color("#ccccaa"));
	const powerUniform = uniform(POWER_DEFAULT);

	const fresnel = f.pow(powerUniform).mul(baseColorUniform);
	const inverseFresnel = f
		.oneMinus()
		.pow(powerUniform)
		.mul(fresnelColorUniform);

	const material = createDisposed(MeshBasicNodeMaterial);
	material.colorNode = fresnel.add(inverseFresnel);

	const geometry = createDisposed(TorusKnotGeometry);

	const mesh = new Mesh(geometry, material);

	const camera = new PerspectiveCamera().translateZ(5);

	const colors = {
		base: `#${baseColorUniform.value.getHexString()}`,
		fresnel: `#${fresnelColorUniform.value.getHexString()}`,
	};
</script>

<div class="relative">
	<PaneContainer
		class="absolute top-2 right-2"
		{@attach (container) => {
			const pane = createDisposed(Pane, {
				container,
				title: "controls",
			});

			pane
				.addBinding(colors, "base", {
					label: "base color",
				})
				.on("change", (e) => {
					baseColorUniform.value.set(e.value);
				});

			pane
				.addBinding(colors, "fresnel", {
					label: "fresnel color",
				})
				.on("change", (e) => {
					fresnelColorUniform.value.set(e.value);
				});

			pane.addBinding(powerUniform, "value", {
				label: "power",
				min: POWER_MIN,
				max: POWER_MAX,
				step: POWER_STEP,
			});
		}}
	/>
	<canvas
		class="aspect-video"
		{@attach (canvas) => {
			const renderer = createRenderer({
				antialias: true,
				canvas,
			});

			const controls = createDisposed(
				OrbitControls,
				camera,
				renderer.domElement,
			);
			controls.autoRotate = true;

			renderer.setAnimationLoop(() => {
				const canvas = renderer.domElement;
				if (resize(renderer)) {
					const aspect = canvas.clientWidth / canvas.clientHeight;
					setCameraAspect(camera, aspect);
				}

				controls.update();
				renderer.render(mesh, camera);
			});
		}}
	>
	</canvas>
</div>
