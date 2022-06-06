<script setup lang="ts">
import Search from "./Search.vue";
import HamburgerMenu from "vue-material-design-icons/Menu.vue";

defineProps<{
  title?: string;
  version?: string;
  links?: {
    href: string;
    text: string;
  }[];
}>();
const emit = defineEmits(["toggle-menu"]);
</script>

<template>
  <div>
    <Search id="search-box" />

    <div id="header-bar" class="border-b border-gray-400 bg-gray-300 py-2">
      <ul
        class="flex flex-row justify-between font-medium text-black sm:text-lg md:text-xl"
      >
        <div class="ml-6 flex flex-row space-x-2">
          <div
            class="mt-[0.125rem] hover:cursor-pointer hover:bg-gray-400"
            @click="emit('toggle-menu')"
          >
            <hamburger-menu />
          </div>
          <li id="header-title">
            {{ title }}
            <template v-if="version != ''">({{ version }})</template>
          </li>
        </div>
        <div
          id="header-links"
          class="mr-6 flex flex-row space-x-6 text-base text-gray-600"
        >
          <a
            v-for="link in links"
            :key="link?.text"
            :href="link?.href"
            class="m-auto h-fit hover:text-gray-500 hover:underline sm:text-sm md:text-base"
            >{{ link?.text }}</a
          >
        </div>
      </ul>
    </div>
  </div>
</template>
