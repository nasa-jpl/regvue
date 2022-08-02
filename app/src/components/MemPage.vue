<script setup lang="ts">
import { computed } from "vue";
import { DesignElement } from "src/types";
import ElementTitle from "src/components/ElementTitle.vue";

const props = defineProps<{
  element: DesignElement;
}>();

const doc = computed(() => {
  if (props.element && props.element.doc) {
    return props.element.doc.replaceAll("\n", "<br />");
  } else {
    return null;
  }
});
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px]">
    <ElementTitle :element="element" class="ml-0" />
    <!-- Show the mem doc description -->
    <div v-if="doc" class="m-auto mt-4">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span class="default-styles" v-html="doc"></span>
    </div>
  </div>
</template>
