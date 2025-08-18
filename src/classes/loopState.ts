export class LoopState {
	loop: (() => void) | null;

	constructor(loop: LoopState["loop"] = null) {
		this.loop = loop;
	}

	get isLooping() {
		return this.loop !== null;
	}
}
