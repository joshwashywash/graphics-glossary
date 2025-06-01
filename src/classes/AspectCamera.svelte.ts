import { PerspectiveCamera } from "three";

/**
 * a `PerspectiveCamera` with an effect that will update its aspect ratio according to `getAspect`
 *
 * @example
 *
 * ```ts
 * const aspect = $state(16 / 9);
 * const camera = new AspectCamera(() => aspect);
 * ```
 */
export default class extends PerspectiveCamera {
	constructor(getAspect: () => number) {
		super();
		$effect(() => {
			this.aspect = getAspect();
			this.updateProjectionMatrix();
		});
	}
}
