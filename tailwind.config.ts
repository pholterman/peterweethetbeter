import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kelly: {
          50: "#f0fbe8",
          100: "#ddf6cc",
          200: "#bceda0",
          300: "#93df68",
          400: "#6ecf3a",
          500: "#4CBB17",
          600: "#3b960f",
          700: "#2f7211",
          800: "#295a13",
          900: "#244c14",
          950: "#0f2a05",
        },
      },
      keyframes: {
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(76, 187, 23, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(76, 187, 23, 0)" },
        },
      },
      animation: {
        "bounce-in": "bounce-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "pulse-green": "pulse-green 2s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
