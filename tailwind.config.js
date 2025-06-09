const formsPlugin = require('@tailwindcss/forms');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#764AF1',
          '50': '#F3EFFF',
          '100': '#E5D9FF',
          '200': '#D0BFFF',
          '300': '#BBA5FF',
          '400': '#A08AFF',
          '500': '#764AF1', // The main primary color
          '600': '#6237DB',
          '700': '#502CAC',
          '800': '#40228A',
          '900': '#321A6F',
          '950': '#22114D'
        },
        dark: {
          '100': '#151515', // New main dark background
          '200': '#202020', // Lighter dark shade
          '300': '#2B2B2B', // Even lighter
          '400': '#363636',
          '500': '#414141',
        },
        accent: {
          'light': '#A08AFF', // Lighter shade of primary
          'dark': '#6237DB', // Darker shade of primary
        },
        'light-100': '#F9FAFB', // Keeping a light gray for light mode backgrounds
      },
      fontFamily: {
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        'big-noodle': ['Big Shoulders Display', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        'soft-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'soft-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.07)',
        'inner-light': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(180deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)',
      }
    },
  },
  plugins: [
    formsPlugin,
  ],
} 