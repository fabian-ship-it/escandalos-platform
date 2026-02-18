/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        scandal: {
          red: '#DC2626',
          dark: '#1a1a2e',
          darker: '#16213e',
          accent: '#e94560',
          gold: '#f5a623',
        },
      },
    },
  },
  plugins: [],
};
