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
	import { Size } from "@classes/Size.svelte";

	import { untrack } from "svelte";
	import type { Attachment } from "svelte/attachments";
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
		WebGLRenderer,
	} from "three";
	import { Pane } from "tweakpane";

	const canvasSize = new Size();

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

	const a = (2 * Math.PI) / geometries.length;

	const groups: Group[] = [];
	const outlineMeshes: Mesh[] = [];

	const scene = new Scene();

	for (const geometry of geometries) {
		const mesh = new Mesh(geometry, material);

		const outlineMesh = new Mesh(geometry, outlineMaterial);
		outlineMeshes.push(outlineMesh);

		const group = new Group().add(mesh, outlineMesh);

		axis.applyAxisAngle(kHat, a);
		group.translateOnAxis(axis, translationAmount);
		groups.push(group);
	}

	scene.add(...groups);

	const camera = new PerspectiveCamera();
	camera.translateOnAxis(kHat, 5 * translationAmount);
	camera.lookAt(scene.position);

	$effect(() => {
		camera.aspect = canvasSize.aspect;
		camera.updateProjectionMatrix();
	});

	$effect(() => {
		return () => {
			material.dispose();
			outlineMaterial.dispose();
			for (const geometry of geometries) {
				geometry.dispose();
			}
		};
	});

	const createAnimationLoop = (renderer: WebGLRenderer) => {
		return () => {
			for (const group of groups) group.rotateY(rotationAmount);
			renderer.render(scene, camera);
		};
	};

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

	const createPaneAttachment = (params: {
		outlineColor: string;
		outlinesVisible: boolean;
		outlineScale: number;
	}): Attachment<HTMLElement> => {
		return (container) => {
			const pane = new Pane({
				container,
				title: "controls",
			});

			pane.addBinding(params, "outlinesVisible", {
				label: "show outlines",
			});
			pane.addBinding(params, "outlineColor", {
				label: "outline color",
			});
			pane.addBinding(params, "outlineScale", {
				label: "outline size",
				min: 1,
				max: 2,
				step: 0.1,
			});

			return () => {
				pane.dispose();
			};
		};
	};

	const pane = createPaneAttachment({
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
</script>

<div
	bind:clientWidth={canvasSize.width}
	class="relative"
>
	<div
		class="absolute top-2 right-2 not-content"
		{@attach pane}
	></div>
	<canvas
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				canvas,
				stencil: true,
			});

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
			});

			const animationLoop = createAnimationLoop(renderer);

			renderer.setAnimationLoop(animationLoop);

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
