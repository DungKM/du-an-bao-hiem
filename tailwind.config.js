/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "Arial", "sans-serif"],
        table: ["var(--font-inter)", "var(--font-be-vietnam-pro)", "Arial", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#D31145",
          dark: "#a3123a",
          light: "#FDF3F6",
          accent: "#E04070",
        },
        gold: {
          DEFAULT: "#B08D57",
          dark: "#8a6a38",
          light: "#E6D9C3",
        },
        sand: {
          DEFAULT: "#D8D2C4",
          bg: "#FBF9F4",
          page: "#F4F1EA",
        },
        sidebar: {
          bg: "#F5F1F2",
          border: "#E8DDE0",
          itemBorder: "#EAE4D6",
          text: "#3A4A42",
          muted: "#B8C0BA",
        },
      },
    },
  },
  plugins: [],
};
