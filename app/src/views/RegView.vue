<script setup lang="ts">
import { ref, computed, watch, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Register, SharedState } from "../types";
import store from "../store";

import Header from "../components/Header.vue";
import Menu from "../components/Menu.vue";
import OpenModal from "../components/OpenModal.vue";
import RegFields from "../components/RegFields.vue";
import RegLayout from "../components/RegLayout.vue";

const props = defineProps<{
  regid: string;
}>();

const route = useRoute();
const router = useRouter();
onBeforeMount(() => validateRoute());

let sharedState = store.sharedState as SharedState;
let selectedField = ref(
  route.query?.field ? (route.query.field as string) : ""
);

// Control whether to show navigation menu on left of screen
let showMenu = ref(true);

// Control whether or not to show the open modal
let showOpenModal = ref(false);

let reg = computed(() => {
  if (sharedState.data) {
    let element_id = props.regid as string;
    return sharedState.data.elements[element_id] as Register;
  } else {
    return null;
  }
});

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

const validateRoute = () => {
  if (!Object.keys(sharedState.data.elements).includes(props.regid)) {
    router.push({
      name: "404",
      params: { catchAll: "404" },
      query: { path: route.path },
    });
  }
};

watch(
  () => route.query.field,
  (newValue) => (selectedField.value = newValue as string)
);

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
    <Menu
      :nodes="sharedState.nodes"
      class="w-[21rem] bg-white pb-1"
      :class="!showMenu ? 'hidden' : ''"
    />

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
            class="m-4 mb-28"
            @select-field="selectField"
            @highlight-field="highlightField"
            @stop-highlight-field="stopHighlightField"
          />
        </div>
      </div>
    </div>
  </div>
</template>
