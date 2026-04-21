import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import cloudflare from '@astrojs/cloudflare';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  integrations: [vue()],
  output: 'server',
  adapter: cloudflare(),
  server: {
    port: 3000
  }
});