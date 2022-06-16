<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Register } from "src/types";

import RegFields from "src/components/RegFields.vue";
import RegLayout from "src/components/RegLayout.vue";

const props = defineProps<{
  reg: Register;
}>();

const route = useRoute();
const router = useRouter();

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

// Change the selectedField variable to match the field url query
watch(
  () => route.query.field,
  (newValue) => (selectedField.value = (newValue as string) || "")
);
</script>

<template>
  <div class="m-auto max-w-[1200px]">
    <!-- Show the field/register value encode/decode table and associated buttons -->
    <RegLayout
      v-if="reg.fields"
      :fields="reg.fields"
      :selected-field="selectedField"
      @select-field="selectField"
      @highlight-field="highlightField"
      @stop-highlight-field="stopHighlightField"
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
      class="mt-8 mb-28 w-full px-2"
      @select-field="selectField"
      @highlight-field="highlightField"
      @stop-highlight-field="stopHighlightField"
    />
  </div>
</template>
