import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), pluginRewriteAll()],
  build: {
    target: "esnext",
  },

  // Allows the app to be run as an embedded deployment (i.e. in a non-root location)
  // https://vitejs.dev/config/#base
  base: "",

  // Allow using "src/" as an alias for "./src" for absolute path import statements
  resolve: {
    alias: {
      src: resolve(__dirname, "./src"),
    },
  },
});
