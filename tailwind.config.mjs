/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#5C1A2E',
          light: '#6D2039',
          dark: '#4A1523',
        },
        bone: {
          DEFAULT: '#F5F0E8',
          dark: '#E8DDD0',
          light: '#FDFAF2',
        },
        gold: {
          DEFAULT: '#B8963E',
          light: '#D4B896',
          dark: '#8F6F2D',
        },
        gris: {
          DEFAULT: '#8C8680',
          light: '#B5AFAA',
          dark: '#6B6560',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        garamond: ['"Cormorant Garamond"', '"EB Garamond"', 'serif'],
        sans: ['Montserrat', 'Optima', 'sans-serif'],
      },
      maxWidth: {
        container: '75rem',
        content: '56.25rem',
        narrow: '50rem',
      },
    },
  },
  plugins: [],
};
