<script setup lang="ts">
import { computed } from "vue";
import { DesignElement } from "src/types";

import BlockTableEntry from "src/components/BlockTableEntry.vue";
import ElementTitle from "src/components/ElementTitle.vue";

const props = defineProps<{
  block: DesignElement;
}>();

const doc = computed(() => {
  if (props.block && props.block.doc) {
    return props.block.doc.replaceAll("\n", "<br />");
  } else {
    return null;
  }
});
</script>

<template>
  <div>
    <div class="mx-auto max-w-[1200px]">
      <ElementTitle :element="block" />

      <!-- Display the doc -->
      <div v-if="doc" class="m-auto mt-4">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span class="default-styles" v-html="doc"></span>
      </div>

      <!-- Display any links that the block has -->
      <div v-if="block.links" class="mt-4">
        <div v-for="link in block.links" :key="link.href">
          <a
            class="text-blue-500 underline"
            :href="link.href"
            target="_blank"
            rel="noreferrer"
            >{{ link.text }}</a
          >
        </div>
      </div>
    </div>

    <!-- Display the child table -->
    <div class="w-full">
      <div class="m-auto mt-8 max-w-[1750px] pb-28 text-center">
        <div class="ml-1 text-left">Sub-Elements Map</div>

        <table class="w-full table-fixed border-2 border-gray-400">
          <thead class="border-2 border-gray-400 bg-gray-200">
            <tr>
              <th class="w-[12%] text-sm">Offset</th>
              <th class="w-[12%] border-l-2 border-gray-400 text-sm">Name</th>
              <th
                v-for="bit in block.data_width"
                :key="bit"
                class="w-[3.5%] border-l-2 border-gray-400 text-sm"
              >
                {{ block.data_width - bit }}
              </th>
            </tr>
          </thead>
          <tbody>
            <BlockTableEntry
              v-for="id in block.children"
              :key="id"
              :element-id="id"
              :data-width="block.data_width"
            />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
