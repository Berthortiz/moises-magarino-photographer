// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { imagetools } from "vite-imagetools";

// https://astro.build/config
export default defineConfig({
  // Required before production: set `site` to the public domain. Without it,
  // static builds use Astro.url.origin (localhost:4321) for canonical/social URLs.
  // site: 'https://www.your-domain.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss(), imagetools()],
  },

  integrations: [icon()],
});