import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: "esnext",
  },

  // Ensure in-source tests aren't included in production
  // https://vitest.dev/guide/in-source.html#production-build
  define: {
    "import.meta.vitest": false,
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
