<script setup lang="ts">
import { computed } from "vue";
import { Register, SharedState } from "../types";
import store from "../store";

import RegFields from "../components/RegFields.vue";
import RegLayout from "../components/RegLayout.vue";

const props = defineProps<{
  regid: string;
}>();

let sharedState = store.sharedState as SharedState;

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
</script>

<template>
  <div v-if="reg">
    <RegLayout v-if="reg.fields" :fields="reg.fields" class="px-4" />

    <div v-if="doc" class="m-auto mx-4 mt-4">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="doc"></span>
    </div>

    <!-- <p class="mt-8 text-2xl font-bold">Fields</p> -->
    <RegFields v-if="reg.fields" :fields="reg.fields" class="m-4" />
  </div>
</template>
