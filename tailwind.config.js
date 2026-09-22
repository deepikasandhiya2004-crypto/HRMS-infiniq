/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00373A",
        accent: "#00DC46",
        purple: "#7C3AED",
        warning: "#FF6A3D",
        cream: "#F9F7E8",
      },
      fontFamily: {
        gellix: ["Gellix", "sans-serif"],
      },
    },
  },
  plugins: [],
};