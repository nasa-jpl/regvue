import { createRouter, createWebHashHistory } from "vue-router";
import store from "./store";
import Default from "./views/Default.vue";
import RegView from "./views/RegView.vue";

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
    name: "field",
    path: "/reg/:regid/field/:fieldName",
    component: RegView,
    props: true,
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
