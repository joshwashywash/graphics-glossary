export class Size {
	width = $state(1);
	height = $state(1);
	aspect = $derived(this.width / this.height);
}
