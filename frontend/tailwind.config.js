/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
        // backwards compat
        navy:    '#08080F',
        accent:  '#F7931A',
        muted:   '#5A5A7A',
      },
      backgroundImage: {
        hero:        'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(247,147,26,0.18) 0%, rgba(8,8,15,0) 65%)',
        'hero-cyan': 'radial-gradient(ellipse 40% 50% at 85% 40%, rgba(0,212,255,0.07) 0%, transparent 60%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.45s ease-out forwards',
        'ticker':     'ticker 28s linear infinite',
        'slide-down': 'slideDown 0.22s ease-out',
        'glow-pulse': 'glowPulse 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
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
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(247,147,26,0.12)' },
          '50%':      { boxShadow: '0 0 36px rgba(247,147,26,0.30)' },
        },
      },
      boxShadow: {
        'glow-orange': '0 0 28px rgba(247,147,26,0.22)',
        'glow-green':  '0 0 20px rgba(0,230,118,0.14)',
        'card':        '0 4px 28px rgba(0,0,0,0.45)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.55)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
