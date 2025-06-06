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
    prefixDefaultLocale: false,
  },
  image: {
    // service: imageService(),
    placeholder: "blurhash",
  },
  adapter: cloudflare({}),
  vite: {
    define: {
      'process.env.PUBLIC_BASE_URL': JSON.stringify(process.env.PUBLIC_BASE_URL),
      'process.env.PUBLIC_STRIPE_KEY': JSON.stringify(process.env.PUBLIC_STRIPE_KEY),
      'process.env.STRIPE_KEY': JSON.stringify(process.env.STRIPE_KEY),
      'process.env.WEATHER_KEY': JSON.stringify(process.env.WEATHER_KEY),
      'process.env.DIRECTUS_API_TOKEN': JSON.stringify(process.env.DIRECTUS_API_TOKEN),
      'process.env.POSTMARK_API_TOKEN': JSON.stringify(process.env.POSTMARK_API_TOKEN),
      'process.env.PURCHASE_CONFIRM_EMAIL_TEMPLATE': JSON.stringify(process.env.PURCHASE_CONFIRM_EMAIL_TEMPLATE),
      'process.env.ESP_PURCHASE_CONFIRM_EMAIL_TEMPLATE': JSON.stringify(process.env.ESP_PURCHASE_CONFIRM_EMAIL_TEMPLATE),
      'process.env.LICENSE_TAKEN_OVER_EMAIL_TEMPLATE': JSON.stringify(process.env.LICENSE_TAKEN_OVER_EMAIL_TEMPLATE),
      'process.env.ESP_LICENSE_TAKEN_OVER_EMAIL_TEMPLATE': JSON.stringify(process.env.ESP_LICENSE_TAKEN_OVER_EMAIL_TEMPLATE),
      'process.env.EARLY_RENEWAL_REMINDER_EMAIL_TEMPLATE': JSON.stringify(process.env.EARLY_RENEWAL_REMINDER_EMAIL_TEMPLATE),
      'process.env.ESP_EARLY_RENEWAL_REMINDER_EMAIL_TEMPLATE': JSON.stringify(process.env.ESP_EARLY_RENEWAL_REMINDER_EMAIL_TEMPLATE),
      'process.env.AUCTION_RENEWAL_REMINDER_EMAIL_TEMPLATE': JSON.stringify(process.env.AUCTION_RENEWAL_REMINDER_EMAIL_TEMPLATE),
      'process.env.ESP_AUCTION_RENEWAL_REMINDER_EMAIL_TEMPLATE': JSON.stringify(process.env.ESP_AUCTION_RENEWAL_REMINDER_EMAIL_TEMPLATE),
      'process.env.LICENSE_EXPIRED_EMAIL_TEMPLATE': JSON.stringify(process.env.LICENSE_EXPIRED_EMAIL_TEMPLATE),
      'process.env.ESP_LICENSE_EXPIRED_EMAIL_TEMPLATE': JSON.stringify(process.env.ESP_LICENSE_EXPIRED_EMAIL_TEMPLATE),
      'process.env.TECH_SUPPORT_EMAIL_TEMPLATE': JSON.stringify(process.env.TECH_SUPPORT_EMAIL_TEMPLATE),
      'process.env.TECH_SUPPORT_EMAIL_ADDRESS': JSON.stringify(process.env.TECH_SUPPORT_EMAIL_ADDRESS),
      'process.env.API_SECRET_KEY': JSON.stringify(process.env.API_SECRET_KEY)
    }
  },
  security: {
		checkOrigin: true
	}
});