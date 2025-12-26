/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#3b82f6',
        'primary-blue-light': '#60a5fa',
        'primary-blue-dark': '#2563eb',
        'accent-green': '#10b981',
        'accent-green-light': '#34d399',
        'accent-purple': '#8b5cf6',
        'accent-purple-light': '#a78bfa',
        'accent-pink': '#ec4899',
        'accent-pink-light': '#f472b6',
        'accent-orange': '#f97316',
        'accent-orange-light': '#fb923c',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
        'gradient-green': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
        'gradient-pink': 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        'gradient-orange': 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.2)',
        'glow-strong': '0 0 30px rgba(59, 130, 246, 0.3)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.2)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.2)',
      }
    },
  },
  plugins: [],
}
