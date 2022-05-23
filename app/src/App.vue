<script setup lang="ts">
import { ref, computed } from "vue";
import store from "./store";
import packageInfo from "../package.json";

import AppVersion from "./components/AppVersion.vue";
import Header from "./components/Header.vue";
import Menu from "./components/Menu.vue";

const appInfo = {
  name: packageInfo.name,
  url: packageInfo.homepage,
  version: packageInfo.version,
};

// Load the data.json file into the store object
store.load("/data1.json");
const sharedState = ref(store.sharedState);

// Parse the data field of sharedState for display variables
const title = computed(
  () =>
    (sharedState.value.data?.root.display_name as string) ||
    "display_name undefined"
);

const version = computed(
  () => (sharedState.value.data?.root.version as string) || "version undefined"
);

const links = computed(() => {
  let o = sharedState.value.data?.root.links;

  if (o != null) {
    return Object.entries(o).map(([k, v]) => {
      let e = { href: v, text: k };
      return e;
    });
  }

  return undefined;
});
</script>

<template>
  <div class="overflow-hidden text-[#2c3e50]">
    <Header :title="title" :version="version" :links="links" />

    <div class="flex flex-row">
      <!-- Show the navigation menu on the left -->
      <Menu :nodes="sharedState.nodes" class="h-[91vh] w-[23rem]" />

      <!-- Show the main window -->
      <div class="mt-4 h-[91vh] flex-grow overflow-y-scroll">
        <router-view class="main-view" />

        <!-- Display a link to the GitHub repo at the bottom right of the page -->
        <AppVersion
          :url="appInfo.url"
          :name="appInfo.name"
          :version="appInfo.version"
          class="float-right mr-4"
        />
      </div>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.topbar .links {
  margin: auto;
  margin-top: 0.7rem;
  top: 0.7rem;
}

.main-view {
  min-height: calc(100vh - 6.5rem);
}
</style>
