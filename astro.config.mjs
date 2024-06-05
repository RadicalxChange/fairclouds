import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  site: 'https://fairclouds.life',
  integrations: [tailwind()],
  i18n: {
    defaultLocale: "en",
    locales: ["es", "en"]
  },
  adapter: cloudflare()
});