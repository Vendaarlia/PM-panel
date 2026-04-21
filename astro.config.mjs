import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import vercel from '@astrojs/vercel';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  integrations: [vue()],
  output: 'server',
  adapter: vercel(),
  server: {
    port: 3000
  }
});
