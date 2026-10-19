/** @type {import('tailwindcss').Config} */
// Ported 1:1 from the inline `tailwind.config` that index.html used to hand the Play CDN.
// Keep the theme identical: the site's look depends on these tokens.
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './constants.tsx',
    './i18n.tsx',
    './types.ts',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
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
  plugins: [],
};
