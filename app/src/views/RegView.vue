<script setup lang="ts">
import { ref, computed, watch, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "src/store";

import Header from "src/components/Header.vue";
import Menu from "src/components/Menu.vue";
import OpenModal from "src/components/OpenModal.vue";
import RegFields from "src/components/RegFields.vue";
import RegLayout from "src/components/RegLayout.vue";

const props = defineProps<{
  regid: string;
}>();

const route = useRoute();
const router = useRouter();
const store = useStore();

onBeforeMount(() => validateRoute());

let selectedField = ref(
  route.query?.field ? (route.query.field as string) : ""
);

// Control whether to show navigation menu on left of screen
let showMenu = ref(true);

// Control whether or not to show the open modal
let showOpenModal = ref(false);

let reg = computed(() => store.elements.get(props.regid));

let doc = computed(() => {
  if (reg.value && reg.value.doc) {
    return reg.value.doc.replaceAll("\n", "<br />");
  } else {
    return null;
  }
});

const selectField = (fieldName: string) => {
  const regid = route?.params?.regid;
  const fieldParam = route?.query?.field;

  if (fieldParam != fieldName) {
    router.push({
      name: "reg",
      params: { regid: regid },
      query: { field: fieldName, data: route.query.data },
    });
  } else {
    router.push({
      name: "reg",
      params: { regid: regid },
      query: { data: route.query.data },
    });
  }
};

const highlightField = (fieldName: string) => {
  if (!route.query.field) {
    selectedField.value = fieldName;
  }
};

const stopHighlightField = () => {
  selectedField.value = route.query?.field ? (route.query.field as string) : "";
};

// Go to 404 page if the current props.regid doesn't exist in the elements map
const validateRoute = () => {
  if (!store.elements.get(props.regid)) {
    router.push({
      name: "404",
      params: { catchAll: "404" },
      query: { path: route.path },
    });
  }
};

// Change the selectedField variable to match the field url query
watch(
  () => route.query.field,
  (newValue) => (selectedField.value = newValue as string)
);

// Watch for route changes and go to 404 page if an invalid regid is given
watch(
  () => props.regid,
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
    <div class="mt-4 flex-grow overflow-y-scroll">
      <div class="m-auto max-w-[1200px]">
        <div v-if="reg">
          <!-- Show the field/register value encode/decode table and associated buttons -->
          <RegLayout
            v-if="reg.fields"
            :fields="reg.fields"
            :selected-field="selectedField"
            class="px-4"
            @select-field="selectField"
            @highlight-field="highlightField"
            @stop-highlight-field="stopHighlightField"
          />

          <!-- Show the register doc description -->
          <div v-if="doc" class="m-auto mx-4 mt-4">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span class="default-styles" v-html="doc"></span>
          </div>

          <!-- Show the register field description table -->
          <RegFields
            v-if="reg.fields"
            :fields="reg.fields"
            :selected-field="selectedField"
            class="mt-8 mb-28 w-full px-6"
            @select-field="selectField"
            @highlight-field="highlightField"
            @stop-highlight-field="stopHighlightField"
          />
        </div>
      </div>
    </div>
  </div>
</template>
