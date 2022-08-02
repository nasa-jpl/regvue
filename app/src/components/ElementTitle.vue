<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { DesignElement } from "src/types";

const props = defineProps<{
  element: DesignElement;
}>();

const route = useRoute();
const router = useRouter();

// Return the link to an ancestor element
const getLink = (index: number) => {
  const id = props.element.id.split(".").slice(0, index + 1);

  return router.resolve({
    name: "element",
    params: { elementId: id },
    query: { data: route.query.data },
  }).href;
};
</script>

<template>
  <div class="mb-3">
    <div>
      <!-- Show the display name -->
      <span id="element-name" class="text-xl font-semibold">
        {{ element.desc ? element.desc : element.name }}
      </span>

      <!-- Show the version if set -->
      <template v-if="element.version"> ({{ element.version }}) </template>

      <!-- Show the full element id -->
      <span v-if="element.id" id="breadcrumb-links">
        -
        <template v-for="(elem, i) in element.id.split('.')" :key="i">
          <!-- Show a breadcrumb link to navigate to an ancestor element -->
          <a
            :id="'breadcrumb-link-' + elem"
            :href="getLink(i)"
            class="text-sm hover:cursor-pointer hover:text-gray-500"
            >{{ elem }}</a
          >

          <template v-if="i < element.id.split('.').length - 1">.</template>
        </template>
      </span>
    </div>

    <!-- Show the size of mem elements -->
    <div v-if="element.size !== undefined">
      {{ element.size }} bytes of memory
    </div>

    <!-- Show the address in hex -->
    <div v-if="element.addr !== undefined">
      {{ "0x" + element.addr.toString(16) }}
    </div>
  </div>
</template>
