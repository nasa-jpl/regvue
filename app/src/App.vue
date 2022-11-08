<script setup lang="ts">
import { ref, provide, onMounted, Ref } from "vue";
import { Rs2JsEvent, LastRs2JsEvent } from "src/types";
import { appInfo, listenForEvents } from "src/platform";

import AppVersion from "src/components/AppVersion.vue";
import ErrorWindow from "src/components/ErrorWindow.vue";
import LoadingIndicator from "src/components/LoadingIndicator.vue";

const lastRs2JsEvent: Ref<undefined | Rs2JsEvent> = ref(undefined);
provide(LastRs2JsEvent, lastRs2JsEvent);

onMounted(async () => {
  await listenForEvents(lastRs2JsEvent);
});

</script>

<template>
  <div class="overflow-hidden text-[#2c3e50]">
    <!-- Show the main window -->
    <div class="h-screen">
      <router-view />
    </div>

    <!-- Show an error window that will capture and display console errors -->
    <ErrorWindow />

    <!-- Show a loading indicator -->
    <LoadingIndicator />

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
