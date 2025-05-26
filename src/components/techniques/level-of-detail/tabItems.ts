import createTabItems from "@functions/createExampleTabItems";

const modules = import.meta.glob<string>(
	"@components/techniques/level-of-detail/*",
	{
		eager: true,
		import: "default",
		query: "?raw",
	},
);

export default createTabItems(modules);
