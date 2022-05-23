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
    class="w-fit rounded-md border border-gray-300 bg-gray-200 py-1 px-2 text-sm"
  >
    Powered by

    <!-- Show a link if the url is not null -->
    <a v-if="url" :href="url" class="text-blue-500 underline"
      >{{ name }} v{{ version }}</a
    >
    <span v-else>{{ name }} v{{ version }}</span>
  </p>
</template>
