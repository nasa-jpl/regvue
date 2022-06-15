<script setup lang="ts">
import { RegisterField } from "src/types";

const props = defineProps<{
  fields: RegisterField[];
  selectedField?: string;
}>();
const emit = defineEmits([
  "select-field",
  "highlight-field",
  "stop-highlight-field",
]);

const navigateToField = (fieldName: string) => {
  emit("select-field", fieldName, props.selectedField == fieldName);
};

const selectField = (fieldName: string) => {
  emit("highlight-field", fieldName);
};

const deselectField = () => {
  emit("stop-highlight-field");
};
</script>

<template>
  <div>
    <table class="w-full border-2">
      <thead class="bg-gray-200">
        <th class="min-w-[5rem] py-2">Bits</th>
        <th class="min-w-[8rem]">Name</th>
        <th class="min-w-[5rem]">Access</th>
        <th>Description</th>
      </thead>
      <tbody>
        <tr
          v-for="field in fields"
          :key="field.name"
          class="border-b-2 hover:cursor-pointer"
          :class="selectedField == field.name ? 'bg-yellow-50' : ''"
          @mouseenter="selectField(field.name)"
          @mouseleave="deselectField"
          @click="navigateToField(field.name)"
        >
          <!-- Show the bit range -->
          <td class="px-2 text-center">
            {{ field.nbits + field.lsb - 1 }}:{{ field.lsb }}
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
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
