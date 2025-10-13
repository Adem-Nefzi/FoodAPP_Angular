/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class", // toggled by adding 'dark-theme' on <body>
  theme: {
    extend: {
      colors: {
        light: {
          background: "#FFF8F0", // soft warm white background
          surface: "#FFFFFF", // clean card/panel surface
          text: "#2D2D2D", // strong readable text
          secondary: "#8B8680", // subtle muted secondary text
          accent: "#D4A574", // golden beige accent (buttons, highlights)
          accentHover: "#C89563", // hover variant of accent
          border: "#E5E1D8", // light organic border tone
        },
        dark: {
          background: "#0F0F0F", // deep dark background
          surface: "#1A1A1A", // card/panel background
          text: "#F5F1E8", // warm light text
          secondary: "#8B8680", // soft grey secondary text
          accent: "#D4A574", // golden beige accent (consistent)
          accentHover: "#C89563", // slightly darker hover
          border: "#2A2A2A", // dark divider lines
        },
      },
      borderRadius: {
        DEFAULT: "0.5rem", // smooth rounded corners
      },
      fontFamily: {
        display: ["Playfair Display", "serif"], // elegant headings
        sans: ["Inter", "sans-serif"], // modern clean body
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)", // consistent smooth transitions
      },
      animation: {
        fadeInUp: "fadeInUp 0.8s ease-out forwards",
        slideInLeft: "slideInLeft 0.8s ease-out forwards",
        slideInRight: "slideInRight 0.8s ease-out forwards",
        scaleIn: "scaleIn 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};
