import type { EventDispatcher } from "three";

export const onDispatcherChange = (
	dispatcher: EventDispatcher<{ change: {} }>,
	listener: () => void,
) => {
	dispatcher.addEventListener("change", listener);
	return () => {
		dispatcher.removeEventListener("change", listener);
	};
};
