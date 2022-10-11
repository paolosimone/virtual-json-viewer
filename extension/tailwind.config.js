module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "viewer-background": "rgb(var(--viewer-background) / <alpha-value>)",
        "viewer-background-focus":
          "rgb(var(--viewer-background-focus) / <alpha-value>)",
        "viewer-key": "rgb(var(--viewer-key) / <alpha-value>)",
        "viewer-text": "rgb(var(--viewer-text) / <alpha-value>)",
        "viewer-value": "rgb(var(--viewer-value) / <alpha-value>)",
        "viewer-value-string":
          "rgb(var(--viewer-value-string) / <alpha-value>)",
      },
    },
  },
  variants: {},
  plugins: [],
};
