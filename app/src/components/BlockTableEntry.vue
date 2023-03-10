<script setup lang="ts">
/* eslint-disable vue/no-v-html */
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "src/store";
import { DataWidth, DesignElement } from "src/types";
import { vResponsiveRotate } from "src/directives/ResponsiveRotate";

import RegFields from "src/components/RegFields.vue";

const props = defineProps<{
  elementId: string;
  dataWidth: DataWidth;
}>();

const route = useRoute();
const router = useRouter();
const store = useStore();

const element = computed(() => {
  const e = store.elements.get(props.elementId);
  if (!e) {
    return { name: "", doc: "", id: "", addr: undefined } as DesignElement;
  }

  return e;
});

const doc = computed(() => {
  if (element.value.doc) {
    return element.value.doc.replaceAll("\n", "<br />");
  } else {
    return null;
  }
});
const addr = computed(() =>
  element.value.addr !== undefined ? "0x" + element.value.addr.toString(16) : ""
);

const collapsed = ref(true);

const href = computed(
  () =>
    router.resolve({
      name: "element",
      params: { elementId: element.value.id.split(".") },
      query: { data: route.query.data },
    }).href
);
</script>

<template>
  <tr
    class="border-2 border-gray-400 hover:cursor-pointer hover:bg-gray-800/10"
    :class="collapsed ? '' : 'bg-gray-800/10'"
    @click="collapsed = !collapsed"
  >
    <!-- Show register's offset -->
    <td :title="addr">
      <div v-responsive-rotate class="flex w-full items-center justify-center">
        {{ addr }}
      </div>
    </td>

    <!-- Show name of register -->
    <td class="border-l-2 border-gray-400" :title="element.name">
      <div v-responsive-rotate class="flex w-full items-center justify-center">
        {{ element.name }}
      </div>
    </td>

    <!-- Show each field in the register -->
    <template v-if="element.type == 'reg'">
      <td
        v-for="field in element.fields"
        :key="field.name"
        :colspan="field.nbits"
        class="truncate border-l-2 border-gray-400 px-2"
        :class="field.access == 'rsvd' ? '' : 'bg-green-800/10'"
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
    <template v-else-if="element.type == 'blk'">
      <td
        :colspan="dataWidth"
        class="border-l-2 border-gray-400 px-2 text-left"
      >
        <div
          class="default-styles max-h-[8rem] overflow-y-scroll"
          v-html="doc"
        ></div>
      </td>
    </template>
    <template v-else-if="element.type == 'mem'">
      <td :colspan="dataWidth" class="truncate border-l-2 border-gray-400 px-2">
        reserved memory
      </td>
    </template>
  </tr>

  <!-- Show an expanded view with register/field descriptions -->
  <tr v-if="!collapsed" class="border-2 border-gray-400">
    <!-- Show a mini view of the field description for the register -->
    <td :colspan="34" class="bg-gray-200">
      <div class="flex flex-row items-center">
        <!-- Show button to collapse view -->
        <button
          class="ml-3 h-10 w-10 rounded px-2 hover:cursor-pointer hover:bg-gray-100/50"
          @click="collapsed = true"
        >
          x
        </button>

        <!-- Show info about the registers/fields -->
        <div class="m-3 grow rounded bg-white px-6">
          <!-- Show the register doc description -->
          <div v-if="doc" class="mt-2 py-2 text-left">
            <span class="default-styles" v-html="doc"></span>
          </div>

          <!-- Display a link to go to the element -->
          <div class="mb-2 text-left">
            Go to
            <a
              class="text-blue-500 underline hover:cursor-pointer hover:text-blue-400"
              :href="href"
              >{{ element.desc ? element.desc : element.name }}</a
            >
          </div>

          <!-- Show the register field description table -->
          <RegFields
            v-if="element.fields"
            :fields="element.fields"
            class="mt-4 w-full bg-white pb-4 text-left"
          />
        </div>
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
