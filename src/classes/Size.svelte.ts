export default class Size {
	width: number;
	aspect: number;
	height: number;

	constructor({ aspect = 16 / 9, width = 1 } = {}) {
		this.aspect = $state(aspect);
		this.width = $state(width);
		this.height = $derived(this.width / this.aspect);
	}
}
