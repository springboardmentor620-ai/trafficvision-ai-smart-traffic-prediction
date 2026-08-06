/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        traffic: {
          low: '#10B981',      // Emerald-500
          medium: '#F59E0B',   // Amber-500
          high: '#EF4444',     // Red-500
          darknavy: '#0F172A', // Slate-900 (Dark Navy background)
          cardnavy: '#1E293B', // Slate-800 (Card background)
          accent: '#3B82F6',   // Blue-500
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}
