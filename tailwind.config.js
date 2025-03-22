/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'ton-blue': '#0088CC',
        'ton-light-blue': '#00AAFF',
        'ton-dark-blue': '#0077B5',
      },
    },
  },
  plugins: [],
}
