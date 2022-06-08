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

let showMenu = ref(true);
</script>

<template>
  <div class="overflow-hidden text-[#2c3e50]">
    <Header class="h-11" @toggle-menu="showMenu = !showMenu" />

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
