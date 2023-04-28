import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import { VitePWA } from "vite-plugin-pwa";

import { readdirSync } from "node:fs";
import { join } from "node:path";

// For syntax highlighting, we use https://github.com/react-syntax-highlighter/react-syntax-highlighter#async-build
// It includes 180+ languages defined as .js files.  We only want to pre-cache
// some of these in our service worker.  See full list in:
// https://github.com/react-syntax-highlighter/react-syntax-highlighter/tree/master/src/languages/prism
const prismLanguagesDir = "node_modules/react-syntax-highlighter/dist/esm/languages/prism";
const includedLanguages = ["css.js", "javascript.js", "typescript.js"];

// bash.js -> assets/bash-*.js
const filenameToGlob = (prefix: string, filename: string) => {
  const [basename, extname] = filename.split(".");
  return join(prefix, `${basename}-*.${extname}`);
};

// Language glob patterns to include
function buildLanguageGlobPatterns(prefix: string) {
  return includedLanguages.map((filename) => filenameToGlob(prefix, filename));
}

// Language glob patterns to exclude
function buildLanguageIgnoreGlobPatterns(prefix: string) {
  const languageFiles = readdirSync(prismLanguagesDir);

  // Turn ['bash.js', ...] into ['assets/bash-*.js', ...]
  // filtering out the languages we want to bundle.
  return languageFiles
    .filter((filename) => !includedLanguages.includes(filename))
    .map((filename) => filenameToGlob(prefix, filename));
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    // https://vite-pwa-org.netlify.app/guide/
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "ChatCraft.org",
        short_name: "ChatCraft",
        icons: [
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
      },
      workbox: {
        // Ignore all Prism languages we don't explicitly include as part of `includedLanguages`
        globIgnores: buildLanguageIgnoreGlobPatterns("**/assets/"),
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg}",
          ...buildLanguageGlobPatterns("**/assets/"),
        ],
      },
    }),
  ],
  build: {
    outDir: "build",
    target: "esnext",
  },
});
