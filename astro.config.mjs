// @ts-check
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const site = "https://joshwashywash.github.io";

const repoURL = `https://github.com/joshwashywash/graphics-glossary`;

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
		svelte({
			compilerOptions: {
				experimental: {
					async: true,
				},
			},
		}),
		sitemap(),
	],

	site,

	vite: {
		plugins: [tailwindcss()],
	},

	adapter: netlify(),
});

