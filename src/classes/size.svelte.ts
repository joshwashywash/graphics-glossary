export class Size {
	width = $state(0);
	height = $state(0);
	ratio = $derived(this.width / this.height);
}
