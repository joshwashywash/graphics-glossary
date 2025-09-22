// @ts-check
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const site = "https://graphics-glossary.vercel.app";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			customCss: ["./src/styles/global.css"],
			editLink: {
				baseUrl: "https://github.com/joshwashywash/graphics-glossary/edit/main",
			},
			expressiveCode: {
				themes: ["rose-pine", "rose-pine-dawn"],
			},
			sidebar: [
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
					label: "Data Buffers",
					autogenerate: {
						directory: "data-buffers",
					},
				},
			],
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/joshwashywash/graphics-glossary",
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
});
