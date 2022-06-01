import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import pluginRewriteAll from "vite-plugin-rewrite-all";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), pluginRewriteAll()],
  build: {
    target: "esnext",
  },

  // Allows the app to be run as an embedded deployment (i.e. in a non-root location)
  // https://vitejs.dev/config/#base
  base: "",
});
