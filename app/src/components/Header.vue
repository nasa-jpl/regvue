<script setup lang="ts">
import Search from "./Search.vue";

defineProps<{
  title?: string;
  version?: string;
  links?: {
    href: string;
    text: string;
  }[];
}>();
</script>

<template>
  <div id="header-bar" class="border-b border-gray-400 bg-gray-300 py-2">
    <ul class="flex flex-row justify-between text-xl font-medium text-black">
      <li id="header-title" class="ml-6">{{ title }} ({{ version }})</li>
      <li class="text-center md:absolute md:w-screen">
        <Search id="search-box" />
      </li>
    </ul>
    <ul v-if="links" class="left-0">
      <li v-for="link in links" :key="link?.text" class="ml-4 w-fit">
        <a :href="link?.href" class="underline hover:text-gray-500">{{
          link?.text
        }}</a>
      </li>
    </ul>
  </div>
</template>
