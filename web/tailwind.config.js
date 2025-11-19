/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // 👈 QUAN TRỌNG: Thêm dòng này để bật Dark Mode
  theme: {
    extend: {
      colors: {
        maroon: '#6C1D18',
        cream: '#F8F3E7',
        gold: '#C7A254',
        coffee: '#3E2723',
        darkBg: '#121212', 
        darkCard: '#1E1E1E'
      }
    }
  },
  plugins: []
}