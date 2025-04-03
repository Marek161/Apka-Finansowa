/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class", // Włącza tryb ciemny oparty na klasach
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        dark: {
          bg: "#121212",
          card: "#1e1e1e",
          input: "#2d2d2d",
          border: "#333333",
          text: "#e0e0e0",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      gradients: {
        "blue-purple": "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        "green-blue": "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
        "orange-red": "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
      },
      boxShadow: {
        dark: "0 4px 6px rgba(0, 0, 0, 0.3)",
        light: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".bg-gradient-blue-purple": {
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        },
        ".bg-gradient-green-blue": {
          background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
        },
        ".bg-gradient-orange-red": {
          background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
