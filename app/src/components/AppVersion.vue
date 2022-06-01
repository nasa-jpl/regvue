<script setup lang="ts">
defineProps<{
  name?: string;
  version?: string;
  url?: string;
}>();
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
  </p>
</template>
