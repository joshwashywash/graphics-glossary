import { Pane } from "tweakpane";

export type Parameters = {
	config: Omit<NonNullable<ConstructorParameters<typeof Pane>[0]>, "container">;
	initialize: (pane: Pane) => void | (() => void);
};

export default ({
	config = {
		expanded: false,
		title: "controls",
	},
	initialize,
}: Partial<Parameters>) => {
	return (container: HTMLElement) => {
		const pane = new Pane({
			...config,
			container,
		});
		const cleanup = initialize?.(pane);
		return () => {
			cleanup?.();
			pane.dispose();
		};
	};
};
