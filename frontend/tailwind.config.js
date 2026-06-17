/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#08080F',
        surface: '#0F0F1A',
        card:    '#16162A',
        line:    '#21213A',
        orange:  '#F7931A',
        cyan:    '#00D4FF',
        bullish: '#00E676',
        bearish: '#FF3355',
        mixed:   '#FFB020',
        dim:     '#5A5A7A',
      },
      animation: {
        'fade-up':    'fadeUp 0.35s ease-out forwards',
        'ticker':     'ticker 28s linear infinite',
        'slide-down': 'slideDown 0.22s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
