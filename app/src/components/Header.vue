<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: "undefined",
  },
  links: {
    type: Object,
    default: null,
  },
  version: {
    type: String,
    default: "undefined",
  },
});
</script>

<template>
  <div class="border-b-2 border-gray-400 bg-gray-300 py-4">
    <ul class="mx-6 flex flex-row justify-between text-2xl">
      <li>{{ title }} ({{ version }})</li>
      <li class="text-center md:absolute md:w-screen">Regvue</li>
      <li>Search Bar</li>
    </ul>
    <ul v-if="links" class="left-0">
      <li v-for="link in links" :key="link" class="ml-4 w-fit">
        <a :href="link.href" class="underline hover:text-gray-500">{{
          link.text
        }}</a>
      </li>
    </ul>
  </div>
</template>
