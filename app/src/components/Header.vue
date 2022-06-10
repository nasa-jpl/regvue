<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import store from "../store";
import Search from "./Search.vue";

import FileReplaceOutline from "vue-material-design-icons/FileReplaceOutline.vue";
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

const route = useRoute();
const router = useRouter();

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

// Set the document title to match the design name
onMounted(() => (document.title = "regvue - " + title.value));
onUnmounted(() => (document.title = "regvue"));
watch(
  () => title.value,
  () => (document.title = "regvue - " + title.value)
);
</script>

<template>
  <div v-if="route.path != '/open'">
    <div
      id="header-bar"
      class="flex flex-row justify-between border-b border-gray-400 bg-gray-300 py-2 font-medium text-black sm:text-lg md:text-xl"
    >
      <div class="ml-6 flex flex-row items-center space-x-2">
        <!-- Show menu to collapse nav bar (needs to be wrapped in div for @click to work) -->
        <div
          class="hover:cursor-pointer hover:bg-gray-400"
          @click="emit('toggle-menu')"
        >
          <hamburger-menu />
        </div>

        <!-- Show design name -->
        <div id="header-title">
          {{ title }}
          <template v-if="version != ''">({{ version }})</template>
        </div>
      </div>

      <Search />

      <div
        id="header-links"
        class="mr-6 flex flex-row items-center space-x-6 text-gray-600 sm:text-sm lg:text-base"
      >
        <a
          v-for="link in links"
          :key="link?.text"
          :href="link?.href"
          class="hover:text-gray-500 hover:underline sm:text-sm md:text-base"
          >{{ link?.text }}</a
        >

        <!-- TODO show a modal instead -->
        <!-- Show icon to route to /open -->
        <file-replace-outline
          class="text-gray-600 hover:cursor-pointer hover:bg-gray-400"
          title="Open a new design file"
          @click="() => router.push({ name: 'open' })"
        />
      </div>
    </div>
  </div>
</template>
