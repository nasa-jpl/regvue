<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "src/store";

import Search from "src/components/Search.vue";

import FileReplaceOutline from "vue-material-design-icons/FileReplaceOutline.vue";

defineProps<{
  title?: string;
  version?: string;
  links?: {
    href: string;
    text: string;
  }[];
}>();

const emit = defineEmits(["toggle-menu", "show-open-modal"]);
const store = useStore();

const route = useRoute();
const router = useRouter();

const title = computed(
  () => (store.root?.display_name as string) || "display_name undefined"
);

const version = computed(() => {
  if (store.root?.version || store.root?.version == "") {
    return store.root.version;
  }

  return "version undefined";
});

const links = computed(() => {
  let o = store.root?.links;

  if (o != null) {
    return Object.entries(o).map(([k, v]) => {
      let e = { href: v, text: k };
      return e;
    });
  }

  return [];
});

const getHomeLink = () => {
  return router.resolve({
    name: "element",
    params: { elementId: "" },
    query: { data: route.query.data },
  }).href;
};

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
      class="flex flex-row justify-between border-b border-gray-400 bg-gray-300 py-2 text-lg font-medium text-black md:text-xl"
    >
      <!-- Show design name -->
      <div id="header-title" class="ml-6 hover:underline">
        <a :href="getHomeLink()">
          {{ title }}
          <template v-if="version != ''">({{ version }})</template>
        </a>
      </div>

      <Search />

      <div
        id="header-links"
        class="mr-6 flex flex-row items-center space-x-6 text-sm text-gray-600 lg:text-base"
      >
        <a
          v-for="link in links"
          :key="link?.text"
          :href="link?.href"
          class="text-sm hover:text-gray-500 hover:underline md:text-base"
          >{{ link?.text }}</a
        >

        <!-- Show icon to open modal to choose new data file -->
        <button
          class="hover:cursor-pointer hover:bg-gray-400"
          @click="emit('show-open-modal')"
        >
          <file-replace-outline
            id="show-open-modal-button"
            class="text-gray-600"
            title="Open a new design file"
          />
        </button>
      </div>
    </div>
  </div>
</template>
