import react from "@vitejs/plugin-react";
import { resolve } from "path";
import fs from "fs/promises";
import { defineConfig, UserConfig, Plugin, build } from "vite";

// TODO
// bundle each page separately -> https://vite.dev/guide/api-javascript.html + 
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
      // must match tsconfig config
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
    configureServer(server) {
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
  return {
    plugins: [react(), manifest(browser)],
    resolve: {
      // must match tsconfig config
      alias: { "@": SRC },
    },
    build: {
      target: "es2017",
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
          chunkFileNames: "pages/[name].js",
          assetFileNames: "pages/[name].[ext]",
        },
      },
    },
  };
}

function manifest(browser: Browser): Plugin {
  return {
    name: "manifest",
    async writeBundle(options) {
      // read manifest template already written in output dir
      const manifestPath = resolve(options.dir!, "manifest.json");
      const manifestContent = (await fs.readFile(manifestPath)).toString();
      const manifest = JSON.parse(manifestContent);

      // set current version
      manifest.version = process.env.npm_package_version;

      // set browser specific fields
      if (browser == "firefox") {
        manifest.background = {
          scripts: [manifest.background.service_worker],
        };
        manifest.browser_specific_settings = {
          gecko: {
            id: "{bb475b2b-f49c-4f3c-ae36-0fe15a6017e9}",
          },
        };
      }

      // write updated manifest
      const updatedManifestContent = JSON.stringify(manifest, null, 2);
      await fs.writeFile(manifestPath, updatedManifestContent);
    },
  };
}

/* Config */

export default defineConfig(({ command, mode }) => {
  return command === "build"
    ? extensionConfig(mode as Browser)
    : serverConfig();
});

// TODO
// build({...extensionConfig("chrome"), configFile: false}).then(() => {console.log("done")});
