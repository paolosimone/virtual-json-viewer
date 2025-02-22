import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const SRC = resolve(import.meta.dirname, "src");

export default defineConfig(({ command }) => {
  if (command === "build") {
    throw new Error("Use vite.build.ts for extension build");
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      // must match tsconfig config
      alias: { "@": SRC },
    },
  };
});
