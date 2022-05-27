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
  <div>
    <Search id="search-box" />

    <div id="header-bar" class="border-b border-gray-400 bg-gray-300 py-2">
      <ul class="flex flex-row justify-between text-xl font-medium text-black">
        <li id="header-title" class="ml-6">{{ title }} ({{ version }})</li>
        <div class="mr-6 flex flex-row space-x-6 text-base text-gray-600">
          <a
            v-for="link in links"
            :key="link?.text"
            :href="link?.href"
            class="m-auto h-fit hover:text-gray-500 hover:underline"
            >{{ link?.text }}</a
          >
        </div>
      </ul>
    </div>
  </div>
</template>
