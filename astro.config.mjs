import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import svelte from '@astrojs/svelte';
import { imageService } from "@unpic/astro/service";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  site: 'https://fairclouds.life',
  integrations: [tailwind(), svelte()],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    prefixDefaultLocale: false
  },
  image: {
    domains: ["cms.fairclouds.life"],
    service: imageService(),
    placeholder: "blurhash"
  },
  adapter: cloudflare({}),
  vite: {
    define: {
      'process.env.PUBLIC_STRIPE_KEY': JSON.stringify(process.env.PUBLIC_STRIPE_KEY),
      'process.env.STRIPE_KEY': JSON.stringify(process.env.STRIPE_KEY),
      'process.env.WEATHER_KEY': JSON.stringify(process.env.WEATHER_KEY),
      'process.env.DIRECTUS_API_TOKEN': JSON.stringify(process.env.DIRECTUS_API_TOKEN),
      'process.env.POSTMARK_API_TOKEN': JSON.stringify(process.env.POSTMARK_API_TOKEN)
    }
  },
  security: {
		checkOrigin: true
	}
});