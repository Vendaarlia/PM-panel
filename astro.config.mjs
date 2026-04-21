import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  integrations: [vue()],
  output: 'server',
  server: {
    port: 3000
  }
});
