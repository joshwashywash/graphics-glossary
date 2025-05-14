// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel";

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
					label: "Guides",
					autogenerate: {
						directory: "guides",
					},
				},
			],
		}),
		svelte(),
		sitemap(),
	],

	vite: {
		plugins: [tailwindcss()],
	},

	adapter: vercel(),
});

