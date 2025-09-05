export class Size {
	aspect: number;
	width: number;
	height: number;

	constructor({ width = 1, aspect = 1 } = {}) {
		this.aspect = $state(aspect);
		this.width = $state(width);
		this.height = $derived(this.width / this.aspect);
	}
}
