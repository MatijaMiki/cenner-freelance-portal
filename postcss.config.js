export default {
  plugins: {
    tailwindcss: {},
    // remove:false keeps the vendor prefixes Tailwind emits (e.g. -webkit-backdrop-filter), as the Play CDN did.
    autoprefixer: { remove: false },
  },
};
