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

const elementId = computed(() => {
  try {
    return props.elementId.join(".");
  } catch {
    return "";
  }
});

const route = useRoute();
const router = useRouter();
const store = useStore();

onBeforeMount(() => validateRoute());

// Control whether or not to show the open modal
let showOpenModal = ref(false);

let element = computed(() => store.elements.get(elementId.value));

// Keyboard shortcut to open/close the nav menu
const useKeyboardShortcut = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key == "b") {
    event.preventDefault();
    toggleMenu();
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
  () => {
    validateRoute();

    if (windowWidth.value < WINDOW_BREAKPOINT) {
      menuVisible.value = false;
    }
  }
);

// Below this value the menu will start to be hidden automatically
const WINDOW_BREAKPOINT = 1200;

let windowWidth = ref(window.innerWidth);
// Update the windowWidth variable on window resize
onBeforeMount(() => {
  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });
});

// Whether or not the nav menu is visible
let menuVisible = ref(windowWidth.value > WINDOW_BREAKPOINT);

const toggleMenu = () => {
  menuVisible.value = !menuVisible.value;

  const sidebar = document.querySelector("#sidebar") as HTMLElement;
  if (sidebar.style.flexBasis == "0.75rem") {
    sidebar.style.flexBasis = "21rem";
  }
};

// Automatically hide/show the menu if the window width crosses the breakpoint
watch(
  () => windowWidth.value,
  (value, old) => {
    if (
      menuVisible.value &&
      value < WINDOW_BREAKPOINT &&
      old >= WINDOW_BREAKPOINT
    ) {
      menuVisible.value = false;
    } else if (
      !menuVisible.value &&
      value >= WINDOW_BREAKPOINT &&
      old < WINDOW_BREAKPOINT
    ) {
      menuVisible.value = true;
    }
  }
);
</script>

<template>
  <!-- Show the header at the top of the page -->
  <Header
    class="h-11"
    @show-open-modal="showOpenModal = true"
    @toggle-menu="toggleMenu()"
  />

  <OpenModal v-if="showOpenModal" @hide-open-modal="showOpenModal = false" />

  <div class="flex h-full flex-row">
    <!-- Show the navigation menu on the left -->

    <!-- If on a smaller window show a grayed-out background -->
    <div
      v-if="windowWidth < WINDOW_BREAKPOINT"
      class="absolute z-40 flex h-full w-full"
      :class="menuVisible ? 'bg-gray-300/50' : 'hidden'"
      @click="menuVisible = false"
    >
      <Menu
        :menu-visible="menuVisible"
        @menu-collapsed="menuVisible = false"
        @resize="menuVisible = true"
        @click.stop
      />
    </div>

    <Menu
      v-else
      :menu-visible="menuVisible"
      @menu-collapsed="menuVisible = false"
      @resize="menuVisible = true"
      @toggle-menu="toggleMenu()"
    />

    <!-- Show the main body and fill the remaining screen space -->
    <div
      class="mt-4 flex h-full flex-grow flex-col justify-between overflow-y-scroll px-8 pb-32"
    >
      <BlockPage v-if="element?.type == 'blk'" :block="element" />
      <RegPage v-else-if="element?.type == 'reg'" :reg="element" />

      <!-- Display footer text if available -->
      <div v-if="store.footerText" class="mx-auto max-w-[800px] text-xs">
        {{ store.footerText }}
      </div>
    </div>
  </div>
</template>
