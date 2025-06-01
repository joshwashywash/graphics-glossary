// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import sitemap from "@astrojs/sitemap";

const site = "https://graphics-glossary.vercel.app";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			customCss: ["./src/styles/global.css"],
			expressiveCode: {
				themes: ["rose-pine", "rose-pine-dawn"],
			},
			title: "3d graphics glossary",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/joshwashywash/graphics-glossary",
				},
			],
			sidebar: [
				{
					label: "Shaders",
					autogenerate: {
						directory: "shaders",
					},
				},
				{
					label: "Techniques",
					autogenerate: {
						directory: "techniques",
					},
				},
			],
		}),
		svelte(),
		sitemap(),
	],
	site,
	vite: {
		plugins: [tailwindcss()],
	},
});
