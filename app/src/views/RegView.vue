<script setup lang="ts">
import { reactive, ComputedRef, computed } from "vue";
import store, { Register } from "../store";

const props = defineProps({
  regid: String,
  field_name: String,
});

let sharedState = reactive(store.sharedState);

let reg = computed(() => {
  if (sharedState.data) {
    let element_id = props.regid as string;
    return sharedState.data.elements[element_id];
  } else {
    return {};
  }
});

let doc = computed(() => {
  let r = reg.value as Register;
  if (r.doc) {
    return r.doc.replaceAll("\n", "<br>");
  } else {
    return "";
  }
});
</script>

<template>
  <p>id: {{ regid }}</p>
  <p>{{ reg }}</p>
  <!-- <p v-for="field in reg?.fields">{{ reg.field }}</p> -->
</template>
