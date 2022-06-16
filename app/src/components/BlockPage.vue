<script setup lang="ts">
import { DesignElement } from "src/types";

import BlockTableEntry from "src/components/BlockTableEntry.vue";

defineProps<{
  block: DesignElement;
}>();
</script>

<template>
  <div>
    <div class="m-auto max-w-[1200px]">
      <!-- Display the name -->
      <div class="text-xl font-semibold">
        <template v-if="block.display_name">{{ block.display_name }}</template>
        <template v-else>{{ block.name }}</template>
      </div>

      <!-- Display the doc -->
      <div>
        {{ block.doc }}
      </div>
    </div>
    <!-- Display the child table -->
    <div class="w-full">
      <div class="m-auto mt-8 max-w-[1500px] overflow-scroll pb-28 text-center">
        <div class="ml-1 text-left">Sub-Elements Map</div>
        <table class="w-full table-fixed border-2 border-gray-400">
          <thead class="border-2 border-gray-400 bg-gray-200">
            <tr>
              <th>Offset</th>
              <th class="border-l-2 border-gray-400">Register/Block Name</th>
              <th
                v-for="bit in 32"
                :key="bit"
                class="w-[2rem] border-l-2 border-gray-400 text-sm"
              >
                {{ 32 - bit }}
              </th>
            </tr>
          </thead>
          <tbody>
            <BlockTableEntry
              v-for="id in block.children"
              :key="id"
              :element-id="id"
            />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
