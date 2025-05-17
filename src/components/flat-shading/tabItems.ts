import createTabItems from "@utils/createExampleTabItems";

const modules = import.meta.glob<string>("@components/flat-shading/*", {
	eager: true,
	import: "default",
	query: "?raw",
});

export default createTabItems(modules);
