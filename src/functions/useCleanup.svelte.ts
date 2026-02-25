/**
 * must be called within an effect such as $effect.root or during component initialization
 */
export const useCleanup = (cleanup: () => void) => {
	$effect(() => {
		return cleanup;
	});
};
