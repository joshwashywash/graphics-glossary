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
