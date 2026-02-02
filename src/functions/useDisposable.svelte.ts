import { useCleanup } from "./useCleanup.svelte";

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
