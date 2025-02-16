import react from "@vitejs/plugin-react";
import { resolve } from "path";
import {
  defineConfig,
  ViteDevServer,
  UserConfig,
  Plugin,
} from "vite";

// TODO
// manifest -> https://github.com/vladshcherbin/rollup-plugin-copy
// URL in options -> https://github.com/rollup/plugins/tree/master/packages/replace
// Test Chrome
// Test Firefox
// remove CRA
// README
// ESLint?

const SRC = resolve(__dirname, "src");
const PAGES = resolve(__dirname, "pages");

/* Development Server */

function serverConfig(): UserConfig {
  return {
    plugins: [react(), redirectBaseUrl()],
    resolve: {
      alias: { "@": SRC },
    },
    build: {
      rollupOptions: {
        input: {
          launcher: resolve(PAGES, "launcher.html"),
        },
      },
    },
  };
}

function redirectBaseUrl(): Plugin {
  return {
    name: "redirect-base-url",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/") {
          req.url = "/pages/launcher.html";
        }
        next();
      });
    },
  };
}

/* Extension Build */

type Browser = "chrome" | "firefox";

function extensionConfig(browser: Browser): UserConfig {
  const appVersion = process.env.npm_package_version;

  return {
    plugins: [react()],
    resolve: {
      // must match tsconfig config
      alias: { "@": SRC },
    },
    build: {
      rollupOptions: {
        input: {
          content: resolve(SRC, "content.ts"),
          background: resolve(SRC, "background.ts"),
          options: resolve(PAGES, "options.html"),
        },
        output: {
          dir: `dist_${browser}`,
          // remove hash
          entryFileNames: "pages/[name].js",
          // chunkFileNames: "pages/[name].js",
          // assetFileNames: "pages/[name].[ext]",
        },
      },
    },
  };
}

/* Config */

export default defineConfig(({ command, mode }) => {
  return command === "build"
    ? extensionConfig(mode as Browser)
    : serverConfig();
});
