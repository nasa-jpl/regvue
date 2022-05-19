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
    class="absolute bottom-4 right-4 mr-2 rounded-md bg-gray-300 p-2"
  >
    Powered by

    <!-- Show a link if the url is not null -->
    <a v-if="url" :href="url" class="text-blue-500 underline"
      >{{ name }} v{{ version }}</a
    >
    <span v-else>{{ name }} v{{ version }}</span>
  </p>
</template>
