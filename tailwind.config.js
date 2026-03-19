/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jelly: {
          dark: '#372020',
          red: '#FF2E2E',
          blue: '#9FBFFF',
          yellow: '#FFEDA1',
        },
      },
    },
  },
  plugins: [],
}
