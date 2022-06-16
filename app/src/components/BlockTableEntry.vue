<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "src/store";
import { Register } from "src/types";
import { vResponsiveRotate } from "src/directives/ResponsiveRotate";

import RegFields from "src/components/RegFields.vue";

const props = defineProps<{
  regid: string;
}>();

const store = useStore();

const reg = computed(() => store.elements.get(props.regid) as Register);
const doc = computed(() => reg.value.doc);

const collapsed = ref(true);
</script>

<template>
  <tr
    class="border-2 border-gray-400 hover:cursor-pointer hover:bg-gray-800/10"
    @click="collapsed = !collapsed"
  >
    <!-- Show register's offset -->
    <td>
      {{ "0x" + reg.offset.toString(16) }}
    </td>

    <!-- Show name of register -->
    <td class="border-l-2 border-gray-400">
      <div v-responsive-rotate class="flex w-full items-center justify-center">
        {{ reg.name }}
      </div>
    </td>

    <!-- Show each field in the register -->
    <template v-if="reg.type == 'reg'">
      <td
        v-for="field in reg.fields"
        :key="field.name"
        :colspan="field.nbits"
        class="truncate border-l-2 border-gray-400 px-2"
        :class="field.access == 'rsvd' ? 'bg-gray-100/50' : 'bg-green-800/10'"
        :title="field.name"
      >
        <div
          v-responsive-rotate
          class="flex w-full items-center justify-center"
        >
          {{ field.name }}
        </div>
      </td>
    </template>
    <template v-else-if="reg.type == 'blk'">
      <td :colspan="32" class="truncate border-l-2 border-gray-400 px-2">
        {{ reg.doc }}
      </td>
    </template>
    <template v-else-if="reg.type == 'mem'">
      <td :colspan="32" class="truncate border-l-2 border-gray-400 px-2">
        reserved memory
      </td>
    </template>
  </tr>

  <tr v-if="!collapsed">
    <!-- Show button to collapse view -->
    <td :colspan="1" class="bg-gray-300">
      <button
        class="h-10 w-10 rounded hover:cursor-pointer hover:bg-gray-100/50"
        @click="collapsed = true"
      >
        x
      </button>
    </td>

    <!-- Show a mini view of the field description for the register -->
    <td :colspan="33" class="bg-gray-300">
      <div class="m-2 rounded bg-white px-4">
        <!-- Show the register doc description -->
        <div v-if="doc" class="py-2 text-left">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="default-styles" v-html="doc"></span>
        </div>

        <!-- Show the register field description table -->
        <RegFields
          v-if="reg.fields"
          :fields="reg.fields"
          class="m-auto mt-8 w-full bg-white pb-4"
        />
      </div>
    </td>
  </tr>
</template>

<style>
/* The ResponsiveRotate directive will add a "rotate" class to objects that this style will apply to */
.rotate {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  transform: rotate(180deg);
  writing-mode: vertical-rl;
}
</style>
