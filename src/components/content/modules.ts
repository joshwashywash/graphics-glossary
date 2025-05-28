import { parse } from "node:path";

const modules = import.meta.glob<string>("./**/*", {
	import: "default",
	query: "?raw",
});

const modulesByDirectory: Record<
	string,
	{
		module: () => Promise<string>;
		parsed: ReturnType<typeof parse>;
	}[]
> = {};

for (const path in modules) {
	const parsed = parse(path);
	const module = modules[path];
	(modulesByDirectory[parsed.dir] ??= []).push({
		module,
		parsed,
	});
}

export default modulesByDirectory;
