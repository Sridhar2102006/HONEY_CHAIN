/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "bc-deep-green": "#14532D",
        "bc-forest": "#166534",
        "bc-green": "#22C55E",
        "bc-light-green": "#DCFCE7",
        "bc-gold": "#F59E0B",
        "bc-amber": "#D97706",
        "bc-light-honey": "#FEF3C7",
        "bc-cream": "#FFFDF5",
        "bc-dark": "#17201A",
        "bc-warning": "#F59E0B",
        "bc-critical": "#DC2626",
        "bc-success": "#16A34A",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};
