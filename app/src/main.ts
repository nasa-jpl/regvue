import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import devtools from "@vue/devtools";
import "./index.css";

if (process.env.NODE_ENV === "development") {
  devtools.connect();
}

createApp(App).use(router).mount("#app");
