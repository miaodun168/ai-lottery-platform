/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#18a058',
        danger:  '#d03050',
        warning: '#f0a020',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
