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
	import createPaneAttachment from "@attachments/createPane";

	import { Size } from "@classes/size.svelte";

	import PaneContainer from "@components/controls/PaneContainer.svelte";

	import { createRenderer } from "@functions/createRenderer.svelte";
	import { updateCameraAspect } from "@functions/updateCameraAspect";
	import { useDisposable } from "@functions/useDisposable.svelte";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { normalWorld, positionViewDirection, uniform } from "three/tsl";
	import {
		Color,
		Mesh,
		MeshBasicNodeMaterial,
		PerspectiveCamera,
		TorusKnotGeometry,
	} from "three/webgpu";

	const baseColorUniform = uniform(new Color("#583583"));
	const fresnelColorUniform = uniform(new Color("#ccccaa"));
	const powerUniform = uniform(POWER_DEFAULT);

	const fresnel = f.pow(powerUniform).mul(baseColorUniform);
	const inverseFresnel = f
		.oneMinus()
		.pow(powerUniform)
		.mul(fresnelColorUniform);

	const material = useDisposable(MeshBasicNodeMaterial);
	material.colorNode = fresnel.add(inverseFresnel);

	const geometry = useDisposable(TorusKnotGeometry);

	const mesh = new Mesh(geometry, material);

	const camera = new PerspectiveCamera().translateZ(5);

	const canvasSize = new Size();
	$effect(() => {
		updateCameraAspect(camera, canvasSize.ratio);
	});

	const colors = {
		get base() {
			return `#${baseColorUniform.value.getHexString()}`;
		},
		set base(value) {
			baseColorUniform.value.set(value);
		},
		get fresnel() {
			return `#${fresnelColorUniform.value.getHexString()}`;
		},
		set fresnel(value) {
			fresnelColorUniform.value.set(value);
		},
	};

	const pane = createPaneAttachment({
		initialize: (pane) => {
			pane.addBinding(colors, "base", {
				label: "base color",
			});

			pane.addBinding(colors, "fresnel", {
				label: "fresnel color",
			});

			pane.addBinding(powerUniform, "value", {
				label: "power",
				min: POWER_MIN,
				max: POWER_MAX,
				step: POWER_STEP,
			});
		},
	});
</script>

<div class="relative">
	<PaneContainer
		class="absolute top-2 right-2"
		{@attach pane}
	/>
	<canvas
		class="example-canvas"
		bind:clientWidth={canvasSize.width}
		bind:clientHeight={canvasSize.height}
		{@attach (canvas) => {
			const renderer = createRenderer(
				{
					antialias: true,
					canvas,
				},
				() => canvasSize.width,
				() => canvasSize.height,
			);

			const controls = useDisposable(
				OrbitControls,
				camera,
				renderer.domElement,
			);
			controls.autoRotate = true;

			renderer.setAnimationLoop(() => {
				controls.update();
				renderer.render(mesh, camera);
			});
		}}
	>
	</canvas>
</div>
