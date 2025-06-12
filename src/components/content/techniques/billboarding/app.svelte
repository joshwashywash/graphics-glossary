<script lang="ts">
	import Scene from "./scene.svelte";

	import boo from "@assets/boo.png";

	import Canvas from "@components/canvas.svelte";
	import Example from "@components/example.svelte";

	import { loadImage } from "@functions/loadImage";

	const promise = loadImage(boo.src, boo.width, boo.height);

	const width = 48;
	const height = 36;
	const count = 35;
</script>

<Example>
	<Canvas>
		{#await promise then image}
			<Scene
				{image}
				{width}
				{height}
				{count}
			/>
		{/await}
	</Canvas>
</Example>
