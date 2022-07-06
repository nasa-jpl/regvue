<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "src/store";
import { DesignElement } from "src/types";

import ElementTitle from "src/components/ElementTitle.vue";
import RegFields from "src/components/RegFields.vue";
import RegLayout from "src/components/RegLayout.vue";

const props = defineProps<{
  reg: DesignElement;
}>();

const route = useRoute();
const router = useRouter();
const store = useStore();

let doc = computed(() => {
  if (props.reg && props.reg.doc) {
    return props.reg.doc.replaceAll("\n", "<br />");
  } else {
    return null;
  }
});

let selectedField = ref(
  route.query?.field ? (route.query.field as string) : ""
);

const selectField = (fieldName: string) => {
  const regid = props.reg.id;
  const fieldParam = route?.query?.field;

  if (fieldParam != fieldName) {
    router.push({
      name: "element",
      params: { elementId: regid.split(".") },
      query: { field: fieldName, data: route.query.data },
    });
  } else {
    router.push({
      name: "element",
      params: { elementId: regid.split(".") },
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

// Change the selectedField variable to match the field url query
watch(
  () => route.query.field,
  (newValue) => (selectedField.value = (newValue as string) || "")
);

const selectDefaultReset = (resetState: string) => {
  const elem = store.elements.get(props.reg.id);
  if (!elem) throw Error(`Could not find element with id ${props.reg.id}`);

  elem.default_reset = resetState;
};
</script>

<template>
  <div class="mx-auto max-w-[1200px]">
    <!-- Show the name/id/addr -->
    <ElementTitle :element="reg" />

    <!-- Show the field/register value encode/decode table and associated buttons -->
    <RegLayout
      v-if="reg.fields"
      :fields="reg.fields"
      :reset-state="reg.default_reset || ''"
      :selected-field="selectedField"
      @select-field="selectField"
      @highlight-field="highlightField"
      @stop-highlight-field="stopHighlightField"
      @select-reset-state="selectDefaultReset($event)"
    />

    <!-- Show the register doc description -->
    <div v-if="doc" class="m-auto mt-4">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span class="default-styles" v-html="doc"></span>
    </div>

    <!-- Show the register field description table -->
    <RegFields
      v-if="reg.fields"
      :fields="reg.fields"
      :selected-field="selectedField"
      class="my-8 w-full px-2"
      @select-field="selectField"
      @highlight-field="highlightField"
      @stop-highlight-field="stopHighlightField"
    />
  </div>
</template>
