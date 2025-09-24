export const onCleanup = (cleanup: () => void) => {
	$effect(() => {
		return () => {
			cleanup();
		};
	});
};
