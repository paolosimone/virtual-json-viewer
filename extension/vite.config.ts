import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

const SRC = resolve(__dirname, "src");

export default defineConfig(({ command }) => {
  if (command === "build") {
    throw new Error("Use vite.build.ts for extension build");
  }

  return {
    plugins: [react()],
    resolve: {
      // must match tsconfig config
      alias: { "@": SRC },
    },
  };
});
