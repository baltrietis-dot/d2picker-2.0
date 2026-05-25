/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Three-color brand palette + neutrals tuned for Dota theme
        obsidian: {
          900: '#0b0d12',  // body bg — near-black with cool undertone
          800: '#11141c',  // panel bg
          700: '#181c27',  // raised panel
          600: '#222735',  // border / divider on panels
          500: '#2d3344',  // hover border
          400: '#3a4156',  // muted border
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',  // primary
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',  // deep gold
          800: '#92400e',
          900: '#78350f',
        },
        dire: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',  // primary enemy
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',  // deep crimson
        },
        radiant: {
          400: '#34d399',
          500: '#10b981',  // primary friendly
          600: '#059669',
          700: '#047857',
          800: '#065f46',  // deep emerald
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'gold-sm': '0 0 0 1px rgba(251, 191, 36, 0.2), 0 2px 12px -2px rgba(251, 191, 36, 0.25)',
        'gold': '0 0 0 1px rgba(251, 191, 36, 0.35), 0 8px 28px -8px rgba(251, 191, 36, 0.4)',
        'gold-lg': '0 0 0 1px rgba(251, 191, 36, 0.5), 0 16px 48px -12px rgba(251, 191, 36, 0.55), inset 0 1px 0 rgba(253, 230, 138, 0.2)',
        'dire': '0 0 0 1px rgba(220, 38, 38, 0.35), 0 8px 28px -8px rgba(220, 38, 38, 0.4)',
        'radiant': '0 0 0 1px rgba(16, 185, 129, 0.35), 0 8px 28px -8px rgba(16, 185, 129, 0.4)',
        'panel': '0 1px 0 rgba(255, 255, 255, 0.03) inset, 0 24px 48px -24px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
