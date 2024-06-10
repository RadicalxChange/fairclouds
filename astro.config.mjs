import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  site: 'https://fairclouds.life',
  integrations: [tailwind()],
  // i18n: {
  //   defaultLocale: "en",
  //   locales: ["es", "en"]
  // },
  adapter: cloudflare({}),
  vite: {
    define: {
      'process.env.PUBLIC_STRIPE_KEY': JSON.stringify(process.env.PUBLIC_STRIPE_KEY),
      'process.env.STRIPE_KEY': JSON.stringify(process.env.STRIPE_KEY),
      'process.env.WEATHER_KEY': JSON.stringify(process.env.WEATHER_KEY)
    }
  }
});