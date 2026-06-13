/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#0D0F14',
        surface: '#1A1D27',
        border:  '#2A2D3A',
        bullish: '#00C896',
        bearish: '#FF4D4D',
        mixed:   '#FFB830',
        accent:  '#4B6BFB',
        muted:   '#8A8FA8',
      },
      backgroundImage: {
        hero: 'linear-gradient(135deg, #4B6BFB 0%, #9B59B6 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
