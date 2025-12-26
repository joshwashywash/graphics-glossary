export class Size {
	width = $state(1);
	height = $state(1);
	ratio = $derived(this.width / this.height);
}
