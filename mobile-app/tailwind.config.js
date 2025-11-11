/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        odanet: {
          primary: '#00A6A6',
          accent: '#007878',
          background: '#F8F8F8',
          text: '#333333',
          textLight: '#666666',
        },
      },
    },
  },
  plugins: [],
};
