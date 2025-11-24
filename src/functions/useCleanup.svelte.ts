/**
 * must be called in a root effect such as a component or with $effect.root
 */
export const useCleanup = (cleanup: () => void) => {
	$effect(() => {
		return () => {
			cleanup();
		};
	});
};
