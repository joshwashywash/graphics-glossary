import type { CodeExampleTabItem } from "@types";
import { parse } from "node:path";

export default (modules: Record<string, string>): CodeExampleTabItem[] => {
	const items: CodeExampleTabItem[] = [];
	for (const path in modules) {
		const code = modules[path];
		const { base, ext } = parse(path);
		const lang = ext.substring(1);
		items.push({
			code,
			label: base,
			lang,
		});
	}
	return items;
};
