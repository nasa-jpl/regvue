import { createApp } from "vue";
import App from "src/App.vue";
import router from "src/router";
import { createPinia } from "pinia";
import "src/index.css";

createApp(App).use(router).use(createPinia()).mount("#app");
