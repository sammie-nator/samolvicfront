/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8f1',
          100: '#f5edd8',
          200: '#ead9b0',
          300: '#dbc07f',
          400: '#cda454',
          500: '#c08e3a',
          600: '#a87430',
          700: '#8a5a2a',
          800: '#714a28',
          900: '#5d3e24',
        },
        charcoal: {
          850: '#1a1a1a',
          900: '#121212',
          950: '#0a0a0a',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
