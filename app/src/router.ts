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
  // If the store hasn't been loaded try to load a file or reroute to the upload page
  if (to.path != "/upload" && !store.loaded) {
    try {
      // Load the data file from the query
      if (to.query?.data) {
        await store.load(to.query.data as string);
      } else {
        throw new Error();
      }
    } catch {
      return { name: "upload" };
    }
  }

  // Check if the data query has changed and the store needs to be reloaded
  if (to.query?.data && store.path != to.query.data) {
    try {
      await store.load(to.query.data as string);
    } catch {
      return { name: "upload" };
    }
  }

  // Go to the first register entry if store is loaded and at root
  if (to.path == "/" && store.loaded && to.query?.data == store.path) {
    return {
      name: "reg",
      params: { regid: store.getFirstRegister() },
      query: { data: store.path },
    };
  }
});

export default router;
