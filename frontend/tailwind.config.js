/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e5ece5',
          200: '#ceddce',
          300: '#abc4ab',
          400: '#83a583',
          500: '#648864',
          600: '#4e6d4e',
          700: '#3f573f',
          800: '#354635',
          900: '#2c3b2c',
        },
        calm: {
          blue: '#e0f2fe',
          teal: '#ccfbf1',
          cream: '#fefce8',
          lavender: '#f3e8ff',
          coral: '#ffe4e6',
        }
      },
      fontSize: {
        'patient-lg': ['1.35rem', { lineHeight: '1.9rem' }],
        'patient-xl': ['1.65rem', { lineHeight: '2.2rem' }],
        'patient-2xl': ['2.15rem', { lineHeight: '2.8rem' }],
      }
    },
  },
  plugins: [],
}
