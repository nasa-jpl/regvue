<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Register, SharedState } from "../types";
import store from "../store";

import Menu from "../components/Menu.vue";
import RegFields from "../components/RegFields.vue";
import RegLayout from "../components/RegLayout.vue";

const props = defineProps<{
  regid: string;
  showMenu: boolean;
}>();

const route = useRoute();
const router = useRouter();

let sharedState = store.sharedState as SharedState;
let selectedField = ref(
  route.query?.field ? (route.query.field as string) : ""
);

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

watch(
  () => route.query.field,
  (newValue) => (selectedField.value = newValue as string)
);
</script>

<template>
  <div class="app-body-height flex flex-row">
    <!-- Show the navigation menu on the left -->
    <Menu
      :nodes="sharedState.nodes"
      class="w-[21rem] bg-white pb-1"
      :class="!showMenu ? 'hidden' : ''"
    />
    <div class="mt-4 flex-grow overflow-y-scroll">
      <div class="m-auto max-w-[1200px]">
        <div v-if="reg">
          <RegLayout
            v-if="reg.fields"
            :fields="reg.fields"
            :selected-field="selectedField"
            class="px-4"
            @select-field="selectField"
            @highlight-field="highlightField"
            @stop-highlight-field="stopHighlightField"
          />

          <div v-if="doc" class="m-auto mx-4 mt-4">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span class="default-styles" v-html="doc"></span>
          </div>

          <RegFields
            v-if="reg.fields"
            :fields="reg.fields"
            :selected-field="selectedField"
            class="m-4"
            @select-field="selectField"
            @highlight-field="highlightField"
            @stop-highlight-field="stopHighlightField"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.app-body-height {
  /* Full screen height minus the height of the header */
  height: calc(100vh - 2.75rem);
}
</style>
