// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { imagetools } from "vite-imagetools";

// https://astro.build/config
export default defineConfig({
  site: 'https://moisesmagarino.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss(), imagetools()],
  },

  integrations: [icon(), sitemap()],
});