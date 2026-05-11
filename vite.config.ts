import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import prerender from 'vite-plugin-prerender';
import Renderer from '@prerenderer/renderer-jsdom';

// Static public routes eligible for prerendering at build time
const PRERENDER_ROUTES = [
  '/',
  '/marketplace',
  '/services',
  '/subscription',
  '/match',
  '/technology',
  '/blog',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/auth',
];

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    prerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: PRERENDER_ROUTES,
      renderer: new Renderer({
        headless: true,
        renderAfterTime: 1000,
      }),
      postProcess(renderedRoute) {
        // Fix asset paths for nested routes
        renderedRoute.html = renderedRoute.html
          .replace(/href="\/([^/])/g, 'href="/$1')
          .replace(/<script (.*?)>/i, '<script $1 defer>');
        return renderedRoute;
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
