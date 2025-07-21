import { parse } from "node:path";

type ModuleRecord = Record<
	string,
	{
		module: () => Promise<string>;
		parsed: ReturnType<typeof parse>;
	}[]
>;

const createModulesByDirectory = (
	modules: Record<string, () => Promise<string>>,
): ModuleRecord => {
	const modulesByDirectory: ModuleRecord = {};

	for (const path in modules) {
		const parsed = parse(path);
		const module = modules[path];
		(modulesByDirectory[parsed.dir] ??= []).push({
			module,
			parsed,
		});
	}
	return modulesByDirectory;
};

const modules = import.meta.glob<string>("./**/*", {
	import: "default",
	query: "?raw",
});

export const modulesByDirectory = createModulesByDirectory(modules);
