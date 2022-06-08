<script setup lang="ts">
import { ref, computed, watch } from "vue";
import store from "../store";
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

let sharedState = ref(store.sharedState);

const title = computed(
  () =>
    (sharedState?.value?.data?.root?.display_name as string) ||
    "display_name undefined"
);

const version = computed(() => {
  if (
    sharedState?.value?.data?.root?.version ||
    sharedState?.value?.data?.root?.version == ""
  ) {
    return sharedState.value.data.root.version;
  }

  return "version undefined";
});

const links = computed(() => {
  let o = sharedState?.value?.data?.root?.links;

  if (o != null) {
    return Object.entries(o).map(([k, v]) => {
      let e = { href: v, text: k };
      return e;
    });
  }

  return [];
});

watch(
  () => title.value,
  () => (document.title = "regvue - " + title.value)
);
</script>

<template>
  <div v-if="sharedState.data">
    <div id="header-bar" class="border-b border-gray-400 bg-gray-300 py-2">
      <ul
        class="flex flex-row justify-between font-medium text-black sm:text-lg md:text-xl"
      >
        <div
          class="ml-6 flex flex-row content-center space-x-2 sm:text-sm lg:text-base"
        >
          <div
            class="m-auto h-fit hover:cursor-pointer hover:bg-gray-400"
            @click="emit('toggle-menu')"
          >
            <hamburger-menu />
          </div>
          <li id="header-title" class="m-auto h-fit">
            {{ title }}
            <template v-if="version != ''">({{ version }})</template>
          </li>
        </div>

        <Search />

        <div
          id="header-links"
          class="mr-6 flex flex-row space-x-6 text-gray-600 sm:text-sm lg:text-base"
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
