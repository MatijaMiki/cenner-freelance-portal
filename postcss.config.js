// Tailwind runs at build time (see tailwind.config.js), followed by autoprefixer, as the Play CDN it
// replaces did (its sheet carried -webkit-backdrop-filter, -webkit-text-decoration-*, and so on).
// Last, every px length becomes rem, so the desktop/tablet root size in index.css scales the whole
// site (see lib/viewportScale.mjs).
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'node:url';
import { pxToRemPlugin } from './lib/viewportScale.mjs';

const TAILWIND_CONFIG = fileURLToPath(new URL('./tailwind.config.js', import.meta.url));

export default {
  plugins: [tailwindcss(TAILWIND_CONFIG), autoprefixer(), pxToRemPlugin()],
};
