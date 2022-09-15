module.exports = {
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      animation: {
        blob: "blob 8s infinite ",
        bounce: "bounce 3s infinite",
        tilt: "tilt 5s infinite linear",
      },
      keyframes: {
        tilt: {
          "0%, 50%, 100%": {
            transform: "rotate(0deg) scale(1)",
          },
          "25%": {
            transform: "rotate(45deg) scale(1.02)",
          },
          "75%": {
            transform: "rotate(-45deg) scale(0.98)",
          },
        },
        blob: {
          "0%": {
            transform: "translate(0px,0px) scale(1)",
          },
          "33%": {
            transform: "translate(-10px,-20px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px,10px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px,0px) scale(1)",
          },
        },
        bounce: {
          "10%": {
            transform: "translateY(0)",
          },
          "33%": {
            transform: "translateY(-10px)",
          },
          "66%": {
            transform: "translateY(0)",
          },
        },
      },
      colors: {
        primary: "#000",
        secondary: "#3C3FA5",
        secondaryHover: "#4447A2",
        bgOne: "#F4F4F4",
        menuBg: "#0d0d0d",
        facebook: "#165DEE",
        facebookHover: "#0E54E0",
      },
      fontFamily: {
        nxt: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          '"Droid Sans"',
          '"Helvetica Neue"',
          "sans-serif",
        ],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
