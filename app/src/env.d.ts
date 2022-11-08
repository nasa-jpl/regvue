/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "vue-material-design-icons";

interface ImportMetaEnv {
  readonly VITE_PLATFORM: "desktop" | "web";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
