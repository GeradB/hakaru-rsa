/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rsa: {
          navy: '#1a2332',
          gold: '#c9a959',
          red: '#8b0000',
          cream: '#f5f0e6',
          gray: '#6b7280',
        }
      },
      fontFamily: {
        heading: ['Georgia', 'serif'],
        body: ['Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
