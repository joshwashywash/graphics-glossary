<script lang="ts">
	let {
		autoRotate = $bindable(true),
		flatShading = $bindable(true),
	}: {
		autoRotate: boolean;
		flatShading: boolean;
	} = $props();
</script>
