/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/views/**/*.ejs", "./src/public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        surface: {
          DEFAULT: "#f7f9fb",
          dim: "#d8dadc",
          bright: "#f7f9fb",
          container: "#eceef0",
          "container-low": "#f2f4f6",
          "container-high": "#e6e8ea",
          "container-highest": "#e0e3e5",
          "container-lowest": "#ffffff",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 16px rgba(25, 28, 30, 0.06)",
        "soft-lg": "0 4px 24px rgba(25, 28, 30, 0.08)",
        "soft-xl": "0 8px 32px rgba(25, 28, 30, 0.12)",
        glow: "0 0 24px rgba(79, 70, 229, 0.15)",
      },
    },
  },
  plugins: [],
};
