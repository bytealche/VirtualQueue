/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#0F0F0F',
        'text-primary': '#EEEEEE',
        'text-secondary': '#999999',
        'accent-green': '#24FB94',
        'accent-cyan': '#13C0BD',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #24FB94 0%, #13C0BD 100%)',
        'gradient-accent-reverse': 'linear-gradient(135deg, #13C0BD 0%, #24FB94 100%)',
      },
      fontFamily: {
        sans: ['Bricolage Grotesque', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        extralight: '200',
      },
    },
  },
  plugins: [],
}