<script setup lang="ts">
import packageInfo from "../package.json";
import AppVersion from "./components/AppVersion.vue";

const appInfo = {
  name: packageInfo.name,
  url: packageInfo.homepage,
  version: packageInfo.version,
};
</script>

<template>
  <div class="overflow-hidden text-[#2c3e50]">
    <!-- Show the main window -->
    <div class="pb-10">
      <router-view />
    </div>

    <!-- Display a link to the GitHub repo at the bottom right of the page -->
    <AppVersion
      :url="appInfo.url"
      :name="appInfo.name"
      :version="appInfo.version"
      class="absolute bottom-4 right-4"
    />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}
</style>
