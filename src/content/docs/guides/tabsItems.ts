import createTabItems from "@utils/createExampleTabs";

const modules = import.meta.glob<string>("@components/vertex-coloring/*", {
	eager: true,
	import: "default",
	query: "?raw",
});

export default createTabItems(modules);
