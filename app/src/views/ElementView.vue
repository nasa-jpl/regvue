<script setup lang="ts">
import { ref, computed, watch, onBeforeMount, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "src/store";

import BlockPage from "src/components/BlockPage.vue";
import Header from "src/components/Header.vue";
import Menu from "src/components/Menu.vue";
import OpenModal from "src/components/OpenModal.vue";
import RegPage from "src/components/RegPage.vue";

const props = defineProps<{
  elementId: string[];
}>();

const elementId = computed(() => props.elementId.join("."));

const route = useRoute();
const router = useRouter();
const store = useStore();

onBeforeMount(() => validateRoute());

// Control whether to show navigation menu on left of screen
let showMenu = ref(true);

// Control whether or not to show the open modal
let showOpenModal = ref(false);

let element = computed(() => store.elements.get(elementId.value));

// Keyboard shortcut to open/close the nav menu
const useKeyboardShortcut = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key == "b") {
    event.preventDefault();
    showMenu.value = !showMenu.value;
  }
};

// Add the keyboard shortcut to open the search box
onBeforeMount(() => {
  document.addEventListener("keydown", useKeyboardShortcut);
});

// Remove the keyboard shortcut to avoid collisions the next time
// the component is mounted
onUnmounted(() => {
  document.removeEventListener("keydown", useKeyboardShortcut);
});

// Go to 404 page if the current props.elementId doesn't exist in the elements map
const validateRoute = () => {
  if (!store.elements.get(elementId.value)) {
    console.log(`NOT FOUND ${elementId}`);
    router.push({
      name: "404",
      params: { catchAll: "404" },
      query: { path: route.path },
    });
  }
};

// Watch for route changes and go to 404 page if an invalid elementId is given
watch(
  () => props.elementId,
  () => validateRoute()
);
</script>

<template>
  <!-- Show the header at the top of the page -->
  <Header
    class="h-11"
    @toggle-menu="showMenu = !showMenu"
    @show-open-modal="showOpenModal = true"
  />

  <OpenModal v-if="showOpenModal" @hide-open-modal="showOpenModal = false" />

  <div class="flex h-full flex-row">
    <!-- Show the navigation menu on the left -->
    <Menu class="w-[21rem] bg-white pb-1" :class="!showMenu ? 'hidden' : ''" />

    <!-- Show the main body and fill the remaining screen space -->
    <div class="mt-4 flex-grow overflow-y-scroll px-8">
      <BlockPage v-if="element?.type == 'blk'" :block="element" />
      <RegPage v-else-if="element?.type == 'reg'" :reg="element" />
    </div>
  </div>
</template>
