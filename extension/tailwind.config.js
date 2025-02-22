/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "input-background": "rgb(var(--input-background) / <alpha-value>)",
        "input-focus": "rgb(var(--input-focus) / <alpha-value>)",
        "input-foreground": "rgb(var(--input-foreground) / <alpha-value>)",
        "json-key": "rgb(var(--json-key) / <alpha-value>)",
        "json-string": "rgb(var(--json-string) / <alpha-value>)",
        "json-value": "rgb(var(--json-value) / <alpha-value>)",
        "toolbar-background": "rgb(var(--toolbar-background) / <alpha-value>)",
        "toolbar-focus": "rgb(var(--toolbar-focus) / <alpha-value>)",
        "toolbar-foreground": "rgb(var(--toolbar-foreground) / <alpha-value>)",
        "viewer-background": "rgb(var(--viewer-background) / <alpha-value>)",
        "viewer-focus": "rgb(var(--viewer-focus) / <alpha-value>)",
        "viewer-foreground": "rgb(var(--viewer-foreground) / <alpha-value>)",
      },
    },
  },
  variants: {},
  plugins: [],
};
