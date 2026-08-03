/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#f5f5f4',
        ink: '#171717',
        muted: '#737373',
        line: '#e5e5e5',
        accent: '#f97316',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        glow: '0 0 80px rgba(249, 115, 22, 0.15)',
      },
    },
  },
  plugins: [],
};
