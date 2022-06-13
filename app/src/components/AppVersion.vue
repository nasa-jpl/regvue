<script setup lang="ts">
import { ref, onBeforeMount } from "vue";

const props = defineProps<{
  name?: string;
  version?: string;
  url?: string;
}>();

let latestVersion = ref("");
onBeforeMount(async () => {
  try {
    const response = await fetch(`${props.url}/blob/main/app/package.json`, {
      mode: "no-cors",
    });
    const packageInfo = await response.json();
    latestVersion.value = packageInfo.version || "";

    latestVersion.value = latestVersion.value.split(".").slice(2).join(".");
  } catch (e) {
    latestVersion.value = "";
  }
});
</script>

<template>
  <!-- Only render if the name and version are both not null -->
  <p
    v-if="name && version"
    id="app-version"
    class="w-fit rounded-md border-2 border-gray-500 bg-gray-300 py-1 px-2 text-sm"
  >
    Powered by

    <!-- Show a link if the url is not null -->
    <a
      v-if="url"
      id="app-source-url"
      :href="url"
      target="_blank"
      rel="nonreferrer"
      class="text-blue-500 underline"
      >{{ name }} v{{ version }}</a
    >
    <span v-else>{{ name }} v{{ version }}</span>

    <!-- Show if a new version of regvue is available -->
    <span v-if="url && latestVersion && latestVersion != version">
      (<a
        :href="`${url}/releases/tag/v${latestVersion}`"
        target="_blank"
        rel="noreferrer"
        class="text-blue-500 underline"
        >v{{ latestVersion }}</a
      >
      available)
    </span>
  </p>
</template>
