/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5fa',
          100: '#e1ebf6',
          200: '#c8dbe9',
          300: '#a1c2d9',
          400: '#73a1c3',
          500: '#5384ab',
          600: '#416a8f',
          700: '#355474',
          800: '#2f4760',
          900: '#2a3d51',
          950: '#1c2837',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
