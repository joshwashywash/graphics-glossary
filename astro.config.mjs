// @ts-check
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const site = "https://joshwashywash.github.io";

const repoURL = "https://github.com/joshwashywash/graphics-glossary";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			customCss: ["./src/styles/global.css"],
			editLink: {
				baseUrl: `${repoURL}/edit/main`,
			},
			expressiveCode: {
				themes: ["rose-pine", "rose-pine-dawn"],
			},
			sidebar: [
				{
					label: "Data Buffers",
					autogenerate: {
						directory: "data-buffers",
					},
				},
				{
					label: "Shaders",
					autogenerate: {
						directory: "shaders",
					},
				},
				{
					label: "Shadows",
					autogenerate: {
						directory: "shadows",
					},
				},
				{
					label: "Techniques",
					autogenerate: {
						directory: "techniques",
					},
				},
				{
					label: "Miscellaneous",
					autogenerate: {
						directory: "miscellaneous",
					},
				},
				{
					label: "Environment Mapping",
					autogenerate: {
						directory: "environment-mapping",
					},
				},
			],
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: repoURL,
				},
			],
			title: "3d graphics glossary",
		}),
		svelte(),
		sitemap(),
	],

	site,

	vite: {
		plugins: [tailwindcss()],
	},

	adapter: cloudflare(),
});
