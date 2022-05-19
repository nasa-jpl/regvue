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
  let o = sharedState.value.data?.root?.links;

  if (o != null) {
    return Object.entries(o).map(([k, v]) => {
      let e = { href: v, text: k };
      return e;
    });
  } else {
    return {};
  }
});
</script>

<template>
  <div class="overflow-hidden text-[#2c3e50]">
    <Header :title="title" :version="version" :links="links" />

    <div class="flex flex-row">
      <Menu :nodes="sharedState.nodes" class="h-[91vh] w-[23rem]" />

      <div class="h-[91vh] flex-grow overflow-y-scroll text-center">
        <router-view />
      </div>
    </div>

    <AppVersion
      :url="appInfo.url"
      :name="appInfo.name"
      :version="appInfo.version"
    />
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
</style>
