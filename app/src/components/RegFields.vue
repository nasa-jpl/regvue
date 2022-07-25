<script setup lang="ts">
import { ref, computed } from "vue";
import { useCookies } from "vue3-cookies";
import { Field } from "src/types";

import SwapVertical from "vue-material-design-icons/SwapVertical.vue";

const props = defineProps<{
  fields: Field[];
  selectedField?: string;
}>();

const emit = defineEmits([
  "select-field",
  "highlight-field",
  "stop-highlight-field",
]);

const { cookies } = useCookies();

const fields = computed(() => {
  if (displayOrder.value == DisplayOrder.msb) {
    return props.fields;
  } else {
    return [...props.fields].reverse();
  }
});

enum DisplayOrder {
  msb,
  lsb,
}
const displayOrder = ref(
  parseInt(cookies.get("regvue-fields-display-order")) || 0
);

// Swap the display order of the fields table
const toggleDisplayOrder = () => {
  if (displayOrder.value == DisplayOrder.msb) {
    displayOrder.value = DisplayOrder.lsb;

    // Store the decision to display lsb first as a cookie
    const nextYear = new Date(new Date().getFullYear() + 2, 0, 0);
    cookies.set(
      "regvue-fields-display-order",
      DisplayOrder.lsb.toString(),
      nextYear
    );
  } else {
    displayOrder.value = DisplayOrder.msb;
    cookies.remove("regvue-fields-display-order");
  }
};

const selectField = (fieldName: string) => {
  emit("select-field", fieldName, props.selectedField == fieldName);
};

const highlightField = (fieldName: string) => {
  emit("highlight-field", fieldName);
};

const stopHighlightField = () => {
  emit("stop-highlight-field");
};
</script>

<template>
  <div>
    <table class="w-full border-2">
      <thead class="bg-gray-200">
        <th class="min-w-[5rem] py-2">
          <div class="m-auto flex w-fit flex-row pl-5">
            Bits

            <!-- Include button to swap the display order of msb/lsb first -->
            <button
              id="toggle-field-display-order-button"
              class="ml-1 hover:cursor-pointer hover:text-gray-400"
              @click="toggleDisplayOrder()"
            >
              <swap-vertical id="swap-vertical-button" />
            </button>
          </div>
        </th>
        <th class="min-w-[8rem]">Name</th>
        <th class="min-w-[5rem]">Access</th>
        <th>Description</th>
      </thead>
      <tbody>
        <tr
          v-for="(field, i) in fields"
          :key="field.name"
          class="border-b-2"
          :class="[
            selectedField == field.name ? 'bg-yellow-50' : '',
            selectedField || selectedField == '' ? 'hover:cursor-pointer' : '',
          ]"
          @mouseenter="highlightField(field.name)"
          @mouseleave="stopHighlightField"
          @click="selectField(field.name)"
        >
          <!-- Show the bit range -->
          <td
            v-if="field.nbits > 1"
            :id="'bit-range-' + i"
            class="px-2 text-center"
          >
            {{ field.nbits + field.lsb - 1 }}:{{ field.lsb }}
          </td>
          <td v-else :id="'bit-range-' + i" class="px-2 text-center">
            {{ field.lsb }}
          </td>

          <!-- Show the field name -->
          <td class="border-l-2 px-2 text-center">
            {{ field.name }}
          </td>

          <!-- Show the access -->
          <td class="border-l-2 px-2 text-center">
            <!-- Replace regular hypens with a non-breaking hypen -->
            <!-- Prevents line wrapping on hypens -->
            {{ field.access.replaceAll("-", "&#8209;") }}
          </td>

          <!-- Show the description as html -->
          <td class="border-l-2 px-2">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="default-styles" v-html="field.doc"></div>

            <div v-if="field.enum" class="my-4 mx-0 w-fit text-left">
              <div>Enumerated values:</div>

              <!-- Add a table to show enumerated field values as Name | Value | Description table -->
              <table class="w-fit min-w-[50%] rounded bg-white">
                <thead class="border-2 border-gray-200 bg-gray-100">
                  <th class="px-2">Name</th>
                  <th class="border-l-2 px-2">Value</th>
                  <th class="border-l-2 px-2">Description</th>
                </thead>
                <tbody>
                  <tr v-for="e in field.enum" :key="e.name" class="border-b">
                    <td class="border-l-2 px-2">
                      {{ e.name }}
                    </td>
                    <td class="border-l-2 px-2">
                      {{ e.value }}
                    </td>
                    <td class="border-x-2 px-2">{{ e.doc }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
#swap-vertical-button > svg {
  height: 1rem;
  width: 1rem;
}
</style>
