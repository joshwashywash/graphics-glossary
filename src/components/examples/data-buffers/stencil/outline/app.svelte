<script
	lang="ts"
	module
>
	const translationAmount = 3;

	const kHat = new Vector3(0, 0, 1);
	const axis = new Vector3(1, 0, 0);

	const rotationAmount = (1 / 180) * Math.PI;
	const initialOutlineScale = 1.1;
</script>

<script lang="ts">
	import { createAttachment } from "./pane";

	import Canvas from "@components/canvas.svelte";

	import { onCleanup } from "@functions/onCleanup.svelte";

	import { untrack } from "svelte";
	import {
		BoxGeometry,
		BufferGeometry,
		Group,
		Mesh,
		MeshBasicMaterial,
		MeshNormalMaterial,
		NotEqualStencilFunc,
		PerspectiveCamera,
		ReplaceStencilOp,
		Scene,
		TorusGeometry,
		TorusKnotGeometry,
		Vector3,
	} from "three";
	import type { WebGLRenderer, WebGLRendererParameters } from "three";

	const stencilRef = 1;

	const material = new MeshNormalMaterial({
		stencilRef,
		stencilWrite: true,
		stencilZPass: ReplaceStencilOp,
	});

	const outlineMaterial = new MeshBasicMaterial({
		depthTest: false,
		stencilFunc: NotEqualStencilFunc,
		stencilRef,
		stencilWrite: true,
	});

	const geometries: BufferGeometry[] = [
		new BoxGeometry(),
		new TorusKnotGeometry(),
		new TorusGeometry(),
	];

	onCleanup(() => {
		material.dispose();
		outlineMaterial.dispose();
		for (const geometry of geometries) {
			geometry.dispose();
		}
	});

	const a = (2 * Math.PI) / geometries.length;

	const groups: Group[] = [];
	const outlineMeshes: Mesh[] = [];

	for (const geometry of geometries) {
		const mesh = new Mesh(geometry, material);

		const outlineMesh = new Mesh(geometry, outlineMaterial);
		outlineMeshes.push(outlineMesh);

		const group = new Group().add(mesh, outlineMesh);

		axis.applyAxisAngle(kHat, a);
		group.translateOnAxis(axis, translationAmount);
		groups.push(group);
	}

	const scene = new Scene().add(...groups);

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(kHat, 5 * translationAmount);
	camera.lookAt(scene.position);

	let outlinesVisible = $state(true);
	$effect(() => {
		for (const outlineMesh of outlineMeshes) {
			outlineMesh.visible = outlinesVisible;
		}
	});

	let outlineColor = $state("#ffffff");
	$effect(() => {
		outlineMaterial.color.setStyle(outlineColor);
	});

	let outlineScale = $state(initialOutlineScale);
	$effect(() => {
		for (const mesh of outlineMeshes) {
			mesh.scale.setScalar(outlineScale);
		}
	});

	const pane = createAttachment({
		get outlineColor() {
			return untrack(() => outlineColor);
		},
		set outlineColor(value) {
			outlineColor = value;
		},
		get outlinesVisible() {
			return untrack(() => outlinesVisible);
		},
		set outlinesVisible(value) {
			outlinesVisible = value;
		},
		get outlineScale() {
			return untrack(() => outlineScale);
		},
		set outlineScale(value) {
			outlineScale = value;
		},
	});

	const rendererParams: WebGLRendererParameters = {
		stencil: true,
	};

	const onRendererResize = (renderer: WebGLRenderer) => {
		const { clientWidth, clientHeight } = renderer.domElement;
		camera.aspect = clientWidth / clientHeight;
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
	};

	const onRendererReady = (renderer: WebGLRenderer) => {
		renderer.setAnimationLoop(() => {
			for (const group of groups) {
				group.rotateY(rotationAmount);
			}

			renderer.render(scene, camera);
		});

		return () => {
			renderer.setAnimationLoop(null);
		};
	};
</script>

<div class="relative">
	<div
		class="absolute top-2 right-2 not-content"
		{@attach pane}
	></div>
	<Canvas
		class="w-full aspect-square"
		{onRendererReady}
		{onRendererResize}
		{rendererParams}
	/>
</div>
