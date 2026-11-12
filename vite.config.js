import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { brand, themeColor } from "./src/theme/brand.js";

const escapeHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// index.html keeps readable values; brand.js overwrites them on build and dev.
const brandHtml = {
  name: "brand-html",
  transformIndexHtml: (html) =>
    html
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(brand.title)}</title>`)
      .replace(
        /(name="apple-mobile-web-app-title" content=")[^"]*/,
        `$1${escapeHtml(brand.shortName)}`,
      )
      .replace(
        /(name="theme-color" content=")[^"]*(" media="\(prefers-color-scheme: light\)")/,
        `$1${themeColor.light}$2`,
      )
      .replace(
        /(name="theme-color" content=")[^"]*(" media="\(prefers-color-scheme: dark\)")/,
        `$1${themeColor.dark}$2`,
      ),
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    brandHtml,
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "fonts/*.woff2",
      ],
      manifest: {
        id: "/",
        name: brand.name,
        short_name: brand.shortName,
        description: brand.description,
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: themeColor.light,
        theme_color: themeColor.light,
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Tool chunks (esp. faker, sql-formatter) can exceed the default 2 MiB cap.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff2,webmanifest}",
        ],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/assets\//],
      },
    }),
  ],
});
