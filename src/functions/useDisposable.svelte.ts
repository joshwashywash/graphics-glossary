import { useCleanup } from "./useCleanup.svelte";

/**
 * must be called within an effect such as $effect.root or component initialization
 * creates an instance of the disposable and calls its `dispose` method when the parent effect is destroyed
 */
export const useDisposable = <
	Disposable extends {
		dispose(): void;
	},
	Args extends unknown[],
>(
	constructor: new (...args: Args) => Disposable,
	...args: NoInfer<Args>
): Disposable => {
	const disposable = new constructor(...args);

	useCleanup(() => {
		disposable.dispose();
	});

	return disposable;
};
