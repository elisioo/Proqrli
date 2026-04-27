// This config is ONLY for the ASP.NET deployment build.
// It bypasses TanStack Start SSR and produces a static SPA
// with a proper index.html that ASP.NET can serve.
//
// Usage:  vite build --config vite.spa.config.ts
// Output: ../wwwroot/frontend/  (index.html + assets/)

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],

  // Assets will be served from /frontend/assets/ in ASP.NET
  base: "/frontend/",

  build: {
    // Write directly into wwwroot so you never have to manually copy files
    outDir: "../wwwroot/frontend",
    emptyOutDir: true,
  },

  // Point Vite at the SPA entry instead of TanStack Start's virtual entry
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
