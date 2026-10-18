// Tailwind runs at build time (see tailwind.config.js), followed by autoprefixer, as the Play CDN it
// replaces did (its sheet carried -webkit-backdrop-filter, -webkit-text-decoration-*, and so on).
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
