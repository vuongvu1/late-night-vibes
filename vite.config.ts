import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const ReactCompilerConfig = {
  /* ... */
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "/assets/favicon.svg",
        "/assets/favicon.ico",
        "/assets/robots.txt",
        "/assets/apple-touch-icon.png",
      ],
      manifest: {
        name: "Late Night Vibes",
        short_name: "LNVibes",
        description:
          "Enjoy a variety of live lofi radio channels through an exquisite online player.",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/assets/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
