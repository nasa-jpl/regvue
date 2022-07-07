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
  const id = props.element.id
    .split(".")
    .slice(0, index + 1)
    .join(".");

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
        {{ element.display_name ? element.display_name : element.name }}
      </span>

      <!-- Show the full element id -->
      <span>
        -
        <template v-for="(elem, i) in element.id.split('.')" :key="i">
          <!-- Show link to navigate to an ancestor element -->
          <a
            :href="getLink(i)"
            class="text-sm hover:cursor-pointer hover:text-gray-500"
            >{{ elem }}</a
          >

          <template v-if="i < element.id.split('.').length - 1">.</template>
        </template>
      </span>

      <!-- Show the version if set -->
      <span v-if="element.version" class="text-sm">
        ({{ element.version }})
      </span>
    </div>

    <!-- Show the address in hex -->
    <div>
      {{ "0x" + element.addr.toString(16) }}
    </div>
  </div>
</template>
