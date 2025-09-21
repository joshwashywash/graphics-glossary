<script lang="ts">
	import {
		FresnelMaterial,
		createUniforms,
		powerConstraints,
	} from "./FresnelMaterial";

	import { Size } from "@classes/Size.svelte";

	import GUI from "lil-gui";
	import {
		Mesh,
		PerspectiveCamera,
		Scene,
		TorusKnotGeometry,
		WebGLRenderer,
	} from "three";

	const uniforms = createUniforms();

	const colors = {
		get baseColor() {
			return `#${uniforms.uBaseColor.value.getHexString()}`;
		},
		set baseColor(value) {
			uniforms.uBaseColor.value.setStyle(value);
		},
		get fresnelColor() {
			return `#${uniforms.uFresnelColor.value.getHexString()}`;
		},
		set fresnelColor(value) {
			uniforms.uFresnelColor.value.setStyle(value);
		},
	};

	const material = new FresnelMaterial(uniforms);

	const geometry = new TorusKnotGeometry();
	const mesh = new Mesh(geometry, material);

	const scene = new Scene().add(mesh);

	$effect(() => {
		return () => {
			material.dispose();
			geometry.dispose();
		};
	});

	const canvasSize = new Size();

	const camera = new PerspectiveCamera();
	camera.translateZ(5);

	$effect(() => {
		camera.aspect = canvasSize.aspect;
		camera.updateProjectionMatrix();
	});

	const rotationAmount = (1 / 180) * Math.PI;
</script>

<div
	bind:clientWidth={canvasSize.width}
	class="relative"
>
	<div
		class="absolute top-0 right-4 not-content"
		{@attach (container) => {
			const gui = new GUI({
				container,
			});

			gui.addColor(colors, "fresnelColor").name("fresnel color");
			gui.addColor(colors, "baseColor").name("base color");
			gui
				.add(
					uniforms.uPower,
					"value",
					powerConstraints.min,
					powerConstraints.max,
					powerConstraints.step,
				)
				.name("power");

			return gui.destroy;
		}}
	></div>
	<canvas
		{@attach (canvas) => {
			const renderer = new WebGLRenderer({
				canvas,
			});

			$effect(() => {
				renderer.setSize(canvasSize.width, canvasSize.height);
			});

			renderer.setAnimationLoop(() => {
				mesh.rotateY(rotationAmount);
				renderer.render(scene, camera);
			});

			return () => {
				renderer.setAnimationLoop(null);
				renderer.dispose();
			};
		}}
	>
	</canvas>
</div>
