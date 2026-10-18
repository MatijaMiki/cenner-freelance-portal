/**
 * Tailwind, compiled at build time (it used to be the Play CDN, compiling in every visitor's browser).
 * Same version as the CDN served (3.4.17) and the same config, moved here verbatim from index.html,
 * so the generated CSS is the same (postcss.config.js adds autoprefixer, as the CDN did).
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './*.{ts,tsx}', './{components,pages,contexts,hooks,lib}/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Homepage: a gothic for headings over a transitional serif for reading.
        display: ['"Libre Franklin"', 'Inter', 'sans-serif'],
        text: ['"Libre Franklin"', 'system-ui', 'sans-serif'],
        term: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        // CRT terminal face for the screen's status lines
        // (Press Start 2P: blocky like the screen's lettering, and it has Č Ć Ž Š Đ)
        crt: ['"Press Start 2P"', '"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          green: '#4ade80',
          pink: '#f472b6',
          black: '#0a0a0a',
          grey: '#1a1a1a',
        },
        // Homepage theme, taken from the meadow film: a cool pale-grey ground, near-black
        // ink, and the film's own sky as the one accent (white on it is ~10:1).
        paper: '#eef0f3',
        paper2: '#e2e5ea',
        ink: '#0b0c0e',
        slate: '#5d6470',
        sky: '#002ca5',
        leaf: '#1b7a3e',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'notify-in': 'notifySlideIn 0.25s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        notifySlideIn: {
          '0%':   { opacity: '0', transform: 'translateX(16px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateX(0)    scale(1)' },
        },
      },
    },
  },
};
