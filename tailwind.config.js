/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        disabled: 'var(--color-disabled)',
      },
      fontFamily: {
        pixel: ['PressStart2P', 'monospace'],
      },
      animation: {
        'crt-flicker': 'flicker 0.15s infinite',
      },
      borderWidth: {
        '1': '1px',
        '2': '2px',
        '3': '3px',
        '4': '4px',
      }
    },
  },
  plugins: [],
};