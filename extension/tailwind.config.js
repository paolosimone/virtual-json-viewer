module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "viewer-background": "rgb(var(--viewer-background) / <alpha-value>)",
      },
    },
  },
  variants: {},
  plugins: [],
};
