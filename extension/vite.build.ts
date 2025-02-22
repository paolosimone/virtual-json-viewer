import react from "@vitejs/plugin-react";
import { resolve } from "path";
import fs from "fs/promises";
import { InlineConfig, build } from "vite";
import { exit } from "process";
import tailwindcss from "@tailwindcss/vite";

type Browser = "chrome" | "firefox";
const BROWSER = process.argv[2] as Browser;

const SRC = resolve(import.meta.dirname, "src");
const PAGES = resolve(import.meta.dirname, "pages");
const DIST = resolve(import.meta.dirname, `dist_${BROWSER}`);

function pageConfig(entrypoint: string, path: string): InlineConfig {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      // must match tsconfig config
      alias: { "@": SRC },
    },
    // mode is used to resolve env variables
    mode: BROWSER,
    // manual multi-step build to avoid sharing chunks
    configFile: false,
    clearScreen: false,
    build: {
      target: "es2017",
      emptyOutDir: false,
      rollupOptions: {
        input: { [entrypoint]: path },
        output: {
          dir: DIST,
          // remove hash to have constant filenames
          entryFileNames: "pages/[name].js",
          chunkFileNames: "pages/[name].js",
          assetFileNames: "assets/[name].[ext]",
        },
      },
    },
  };
}

async function patchManifest() {
  // read manifest template written in output dir
  const manifestPath = resolve(DIST, "manifest.json");
  const manifestContent = (await fs.readFile(manifestPath)).toString();
  const manifest = JSON.parse(manifestContent);

  // set current version
  manifest.version = process.env.npm_package_version;

  // set browser specific fields
  if (BROWSER == "firefox") {
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
}

async function buildExtension() {
  // clean dist dir before building
  await fs.rm(DIST, { recursive: true, force: true });
  await build(pageConfig("content", resolve(SRC, "content.ts")));
  await build(pageConfig("background", resolve(SRC, "background.ts")));
  await build(pageConfig("options", resolve(PAGES, "options.html")));
  await patchManifest();
}

buildExtension()
  // have to exit manually because tsx keeps running the promise in loop
  .then(() => exit(0))
  .catch(() => exit(1));
