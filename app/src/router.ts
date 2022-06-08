import { createRouter, createWebHashHistory } from "vue-router";
import store from "./store";
import Default from "./views/Default.vue";
import RegView from "./views/RegView.vue";
import UploadView from "./views/UploadView.vue";

const routes = [
  {
    name: "default",
    path: "/",
    component: Default,
  },
  {
    name: "reg",
    path: "/reg/:regid",
    component: RegView,
    props: true,
  },
  {
    name: "upload",
    path: "/upload",
    component: UploadView,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (to.path == "/") {
    await store.untilLoaded();
    return { name: "reg", params: { regid: store.getFirstRegister() } };
  }
});

export default router;
