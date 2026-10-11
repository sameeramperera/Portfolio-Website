// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/config.ts';

export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'never',
  // Inline the (small) stylesheet to avoid a render-blocking request.
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
