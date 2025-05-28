export default () => {
	return import.meta.glob<string>("./*", {
		eager: true,
		import: "default",
		query: "?raw",
	});
};
