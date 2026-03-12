<script
	module
	lang="ts"
>
	const faces = [
		{ name: "posx", longName: "positive x", row: 2, col: 3 },
		{ name: "negx", longName: "negative x", row: 2, col: 1 },
		{ name: "posy", longName: "positive y", row: 1, col: 2 },
		{ name: "negy", longName: "negative y", row: 3, col: 2 },
		{ name: "posz", longName: "positive z", row: 2, col: 2 },
		{ name: "negz", longName: "negative z", row: 2, col: 4 },
	] as const;
</script>

<script lang="ts">
	type Key = (typeof faces)[number]["name"];
	const props: Record<Key, string> = $props();
</script>

<div class="grid grid-cols-4 grid-rows-3">
	{#each faces as { name, longName, row, col }}
		<img
			src={props[name]}
			alt={`cube map image for ${longName}`}
			style:--row={row}
			style:--col={col}
			class="row-(--row) col-(--col) mt-0"
		/>
	{/each}
</div>
