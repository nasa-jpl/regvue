<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Register, SharedState } from "../types";
import store from "../store";

import RegFields from "../components/RegFields.vue";
import RegLayout from "../components/RegLayout.vue";

const props = defineProps<{
  regid: string;
  fieldName?: string;
}>();

let sharedState = store.sharedState as SharedState;
let selectedField = ref(props.fieldName);

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

const route = useRoute();
const router = useRouter();
const navigateToField = (fieldName: string) => {
  const regid = route?.params?.regid;
  const fieldParam = route?.params?.fieldName;

  if (fieldParam != fieldName) {
    router.push({
      name: "field",
      params: { regid: regid, fieldName: fieldName },
    });
  } else {
    router.push({ name: "reg", params: { regid: regid } });
  }
};

const selectField = (fieldName: string) => {
  if (!props.fieldName) {
    selectedField.value = fieldName;
  }
};

const deselectField = () => {
  selectedField.value = props.fieldName;
};
</script>

<template>
  <div v-if="reg">
    <RegLayout
      v-if="reg.fields"
      :fields="reg.fields"
      :selected-field="selectedField"
      class="px-4"
      @navigate-to-field="navigateToField"
      @select-field="selectField"
      @deselect-field="deselectField"
    />

    <div v-if="doc" class="m-auto mx-4 mt-4">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="doc"></span>
    </div>

    <RegFields
      v-if="reg.fields"
      :fields="reg.fields"
      :selected-field="selectedField"
      class="m-4"
      @navigate-to-field="navigateToField"
      @select-field="selectField"
      @deselect-field="deselectField"
    />
  </div>
</template>
