/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332',
          light: '#2D6A4F',
          dark: '#0B2B1F',
        },
        secondary: '#2D6A4F',
        accent: '#40916C',
        background: '#FAFAF5',
        surface: '#FFFFFF',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['PlayfairDisplay', 'serif'],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        pill: '24px',
      },
    },
  },
  plugins: [],
};
