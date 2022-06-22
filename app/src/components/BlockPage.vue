<script setup lang="ts">
import { DesignElement } from "src/types";

import BlockTableEntry from "src/components/BlockTableEntry.vue";

defineProps<{
  block: DesignElement;
}>();
</script>

<template>
  <div>
    <div class="mx-auto max-w-[1200px]">
      <div class="mb-3">
        <div>
          <!-- Show name -->
          <span class="text-xl font-semibold">
            {{ block.display_name ? block.display_name : block.name }}
          </span>
          <!-- Show the version -->
          <template v-if="block.version" class="text-lg">
            - ({{ block.version }})
          </template>
        </div>
        <!-- Show the starting address of the block -->
        <div>
          {{ "0x" + block.addr.toString(16) }}
        </div>
      </div>

      <!-- Display the doc -->
      <div>
        {{ block.doc }}
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
                v-for="bit in 32"
                :key="bit"
                class="w-[3.5%] border-l-2 border-gray-400 text-sm"
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
