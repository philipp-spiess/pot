import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    outDir: "../priv/static", // phoenix expects our files here
    // emptyOutDir: true, // cleanup previous builds
    // sourcemap: true, // we want to debug our code in production
    rollupOptions: {
      // overwrite default .html entry
      input: {
        main: "src/main.tsx",
      },
    },
  },
});
