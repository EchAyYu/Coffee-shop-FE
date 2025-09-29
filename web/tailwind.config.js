/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon: '#6C1D18',
        cream: '#F8F3E7',
        gold: '#C7A254',
        coffee: '#3E2723'
      }
    }
  },
  plugins: []
}