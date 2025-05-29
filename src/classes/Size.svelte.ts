export default class {
	width: number;
	ratio: number;
	height: number;

	constructor({ ratio = 16 / 9, width = 1 } = {}) {
		this.ratio = $state(ratio);
		this.width = $state(width);
		this.height = $derived(this.width / this.ratio);
	}
}
