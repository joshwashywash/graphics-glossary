import createTabItems from "@functions/createExampleTabItems";

const modules = import.meta.glob<string>(
	"@components/materials/vertex-colors/*",
	{
		eager: true,
		import: "default",
		query: "?raw",
	},
);

export default createTabItems(modules);
