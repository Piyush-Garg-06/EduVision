/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090b11',
        darkCard: 'rgba(20, 24, 38, 0.75)',
        glowIndigo: '#6366f1',
        glowCyan: '#06b6d4',
        glowEmerald: '#10b981',
        glowAmber: '#f59e0b',
        glowRose: '#ef4444'
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
