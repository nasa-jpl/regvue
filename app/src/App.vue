<script setup lang="ts">
import { ref, computed, watch } from "vue";
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
store.load("data.json");
let sharedState = ref(store.sharedState);

// Control whether or not to show navigation menu
let showMenu = ref(true);

// Parse the data field of sharedState for display variables
const title = computed(
  () =>
    (sharedState?.value?.data?.root?.display_name as string) ||
    "display_name undefined"
);

const version = computed(() => {
  if (
    sharedState?.value?.data?.root?.version ||
    sharedState?.value?.data?.root?.version == ""
  ) {
    return sharedState.value.data.root.version;
  }

  return "version undefined";
});

const links = computed(() => {
  let o = sharedState?.value?.data?.root?.links;

  if (o != null) {
    return Object.entries(o).map(([k, v]) => {
      let e = { href: v, text: k };
      return e;
    });
  }

  return [];
});

watch(
  () => title.value,
  () => (document.title = "regvue - " + title.value)
);
</script>

<template>
  <div class="overflow-hidden text-[#2c3e50]">
    <Header
      :title="title"
      :version="version"
      :links="links"
      class="h-11"
      @toggle-menu="showMenu = !showMenu"
    />

    <div class="app-body-height flex flex-row">
      <!-- Show the navigation menu on the left -->
      <Menu
        :nodes="sharedState.nodes"
        class="w-[21rem] bg-white pb-1"
        :class="!showMenu ? 'hidden' : ''"
      />

      <!-- Show the main window -->
      <div class="mt-4 flex-grow overflow-y-scroll">
        <router-view class="pb-10" />

        <!-- Display a link to the GitHub repo at the bottom right of the page -->
        <AppVersion
          :url="appInfo.url"
          :name="appInfo.name"
          :version="appInfo.version"
          class="absolute bottom-4 right-4"
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
  height: 100vh;
}

.app-body-height {
  /* Full screen height minus the height of the header */
  height: calc(100vh - 2.75rem);
}
</style>
